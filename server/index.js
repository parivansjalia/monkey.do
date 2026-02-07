import express from "express";
import cors from "cors";
import OpenAI from "openai";
import Parallel from "parallel-web";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Parallel AI
const parallel = new Parallel({
  apiKey: process.env.PARALLEL_API_KEY,
});

// Load prompts from template files
const SYSTEM_PROMPT = readFileSync(
  join(__dirname, "prompts", "system.txt"),
  "utf-8"
);

const POST_VIDEO_ADDON = readFileSync(
  join(__dirname, "prompts", "post-video.txt"),
  "utf-8"
);

const SEARCH_OBJECTIVE_PROMPT = readFileSync(
  join(__dirname, "prompts", "search-objective.txt"),
  "utf-8"
);

const SUMMARIZE_SEARCH_PROMPT = readFileSync(
  join(__dirname, "prompts", "summarize-search.txt"),
  "utf-8"
);

// Store conversations in memory (will be replaced with Supabase later)
const conversations = new Map();

// Helper to build message history for OpenAI
function buildMessages(conversationHistory, systemPrompt = SYSTEM_PROMPT) {
  return [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    })),
  ];
}

// POST /api/chat - Main chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, image, conversationId, conversationHistory = [] } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: "Message or image required" });
    }

    // Build the user message content
    let userContent = message || "";
    if (image) {
      userContent = userContent || "What do you think of this image?";
    }

    // Add user message to history for this request
    const historyWithNewMessage = [
      ...conversationHistory,
      { role: "user", content: userContent },
    ];

    const messages = buildMessages(historyWithNewMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0]?.message?.content || "🙈 Oops, I got shy!";

    res.json({
      response: aiResponse,
      conversationId: conversationId || crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// POST /api/chat/post-video - Response after video generation with follow-up suggestions
app.post("/api/chat/post-video", async (req, res) => {
  try {
    const { videoUrl, conversationHistory = [], originalPrompt } = req.body;

    const postVideoSystemPrompt = `${SYSTEM_PROMPT}\n\n${POST_VIDEO_ADDON}`;

    const historyWithContext = [
      ...conversationHistory,
      { 
        role: "user", 
        content: `[Video was generated based on: "${originalPrompt}"]` 
      },
    ];

    const messages = buildMessages(historyWithContext, postVideoSystemPrompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      max_tokens: 400,
      temperature: 0.9,
    });

    const aiResponse = completion.choices[0]?.message?.content || "🙈 Your video is ready!";

    // Extract follow-up suggestions (simple parse)
    const suggestions = extractSuggestions(aiResponse);

    res.json({
      response: aiResponse,
      suggestions,
      videoUrl,
    });
  } catch (error) {
    console.error("Post-video error:", error);
    res.status(500).json({ error: "Failed to generate post-video response" });
  }
});

// Helper to extract suggestions from AI response
function extractSuggestions(text) {
  const lines = text.split("\n").filter((line) => line.trim());
  const suggestions = [];
  
  for (const line of lines) {
    // Look for numbered items or bullet points
    const match = line.match(/^[\d\-\*\•]\s*\.?\s*(.+)/);
    if (match) {
      suggestions.push(match[1].trim());
    }
  }
  
  return suggestions.slice(0, 3); // Max 3 suggestions
}

// POST /api/chat/continue - Continue conversation with full context
app.post("/api/chat/continue", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const historyWithNewMessage = [
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const messages = buildMessages(historyWithNewMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    const aiResponse = completion.choices[0]?.message?.content || "🙈 Let me think about that...";

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error("Continue chat error:", error);
    res.status(500).json({ error: "Failed to continue conversation" });
  }
});

// POST /api/generate - Full pipeline: prompt → search → summarize → ready for Fal
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, image } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const hasImage = !!image;
    console.log("🔍 Step 1: Generating search objective...", hasImage ? "(with image)" : "");
    
    // Step 1: Use GPT-4.1 to generate search objective
    const objectiveCompletion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SEARCH_OBJECTIVE_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const searchObjective = objectiveCompletion.choices[0]?.message?.content?.trim();
    console.log("📝 Search objective:", searchObjective);

    // Step 2: Search with Parallel AI
    console.log("🌐 Step 2: Searching with Parallel AI...");
    const searchResponse = await parallel.beta.search({
      mode: "one-shot",
      search_queries: null,
      max_results: 10,
      objective: searchObjective,
    });

    console.log("✅ Search complete, got results");

    // Step 3: Summarize search results for video generation
    console.log("📋 Step 3: Summarizing for video generation...");
    
    // Extract text content from search results
    const searchContent = searchResponse.results
      ?.map((r) => r.content || r.snippet || r.title)
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 4000); // Limit context size

    // Build context with image reference if provided
    const imageContext = hasImage 
      ? "\n\nIMPORTANT: The user uploaded an image. Use the uploaded image as the visual reference and background. Describe the action happening on/with their uploaded image, NOT a generic background."
      : "";

    const summaryCompletion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SUMMARIZE_SEARCH_PROMPT },
        { 
          role: "user", 
          content: `Original request: "${prompt}"${imageContext}\n\nSearch results:\n${searchContent}` 
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const videoPrompt = summaryCompletion.choices[0]?.message?.content?.trim();
    console.log("🎬 Video prompt ready:", videoPrompt);

    res.json({
      originalPrompt: prompt,
      searchObjective,
      videoPrompt,
      hasImage,
      searchResultCount: searchResponse.results?.length || 0,
    });
  } catch (error) {
    console.error("Generate pipeline error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "monkeydo-api" });
});

app.listen(PORT, () => {
  console.log(`🙈 MonkeyDo API running on port ${PORT}`);
});

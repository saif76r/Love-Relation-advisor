/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Lazy-initialized Gemini client to prevent crash on startup if API key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Gemini Key Exists:", !!apiKey);
    if (!apiKey) {
      console.error("❌ Gemini API key missing. Add GEMINI_API_KEY to your .env or Vercel environment variables.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Empathetic Chat Advisor API Endpoint
router.post("/chat", async (req, res) => {
  try {
    const { messages, partner1, partner2, userMode } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Elegant rule-based / keyword-based advisor fallback response
      const lastUserMessage = messages && messages.length > 0 
        ? messages[messages.length - 1].text.toLowerCase() 
        : "";
      
      let replyText = "";
      const p1 = partner1 || "Partner 1";
      const p2 = partner2 || "Partner 2/Crush";
      const isSingle = userMode === 'single';

      const setupTip = "\n\n*(✨ Amour setup tip: To connect my live, fully-cognitive Gemini AI brain in your own cloned app on Vercel or locally, please ensure `GEMINI_API_KEY` is added to your environment variables!)*";

      if (isSingle) {
        if (lastUserMessage.includes("confess") || lastUserMessage.includes("propose") || lastUserMessage.includes("ask")) {
          replyText = `Confessing your feelings to ${p2} is a courageous, beautiful step, ${p1}! The best approach is to keep it authentic, simple, and light. I suggest inviting them to a peaceful, casual spot—like a cozy local coffee shop or a walk at sunset. 

You could say: *"Hey ${p2}, I've really loved spending time together lately. You have this wonderful warmth that always makes my day brighter, and I've developed a bit of a crush on you. I'd love to take you out on a real date to get to know you even better!"* 

Just be your genuine self. No matter what, sharing your heart is a great victory for self-love and growth!` + setupTip;
        } else if (lastUserMessage.includes("sad") || lastUserMessage.includes("anxious") || lastUserMessage.includes("scared") || lastUserMessage.includes("nervous") || lastUserMessage.includes("fear")) {
          replyText = `It is completely natural to feel nervous and anxious when your feelings are on the line, ${p1}. Take a slow, warm breath. Mindful breathing helps ground your spirit.

Your sensitivity is a sign of your beautiful sincerity. No matter how ${p2} responds, your personal worth is absolute and gorgeous. Try to build a comfortable, play-centered bridge first: spark light, casual conversations, share a fun meme, and see how they react. I am walking with you at every step!` + setupTip;
        } else if (lastUserMessage.includes("hi") || lastUserMessage.includes("hello") || lastUserMessage.includes("hey")) {
          replyText = `Hello, dear ${p1}! I am Amour, your private Love Coach. I am here to help you navigate your sweet thoughts and feelings for ${p2}. 

Tell me, what are you currently seeking advice with? Are you wondering how to break the ice with them, looking for sweet message formulas, or finding the confidence to approach them?` + setupTip;
        } else {
          replyText = `I hear you loud and clear, ${p1}. Navigating your thoughts about ${p2} can feel like a beautiful mystery. 

To help me give you the best guidance: Could you tell me a little more about how you and ${p2} usually interact? Do you chat often, or are you hoping to find a creative way to start your very first conversation? I'm listening!` + setupTip;
        }
      } else {
        // Couples mode fallback
        if (lastUserMessage.includes("fight") || lastUserMessage.includes("conflict") || lastUserMessage.includes("argue") || lastUserMessage.includes("angry") || lastUserMessage.includes("shout")) {
          replyText = `Arguments and conflicts can feel exhausting, but they are also portals to deeper listening and understanding, ${p1}. In a loving partnership like yours with ${p2}, it's rarely about who is right, but rather about how both of you feel.

I suggest starting a conversation tonight with zero accusations. Use 'I' statements: *"I feel a bit overwhelmed when things get tense, and I really want to understand your perspective so we can tackle this as a team."* Give each other 5 minutes of uninterrupted listening. You can heal this together!` + setupTip;
        } else if (lastUserMessage.includes("distant") || lastUserMessage.includes("lonely") || lastUserMessage.includes("bored") || lastUserMessage.includes("quiet")) {
          replyText = `Recognizing distance is the very first step back to closeness, ${p1}. Often, busy schedules and life's daily noises block our connection with the ones we cherish. 

I suggest doing a 'Miniature Surprise Sequence' this week: leave a handwritten sticky note on ${p2}'s desk or mirror, or schedule a simple 20-minute device-free stroll of appreciation after dinner. Focus on memory-making rather than solving chores. Little sparks light the softest fires.` + setupTip;
        } else if (lastUserMessage.includes("hi") || lastUserMessage.includes("hello") || lastUserMessage.includes("hey")) {
          replyText = `Greetings, dear ${p1}! I am Amour, your Relationship Advisor. I am absolutely delighted to support you and ${p2} on your journey together. 

What is on your heart today? Whether you want to reflect on a beautiful moment, resolve a subtle conflict, or get ideas to keep your spark bright, I am here to hold a compassionate space for you.` + setupTip;
        } else {
          replyText = `Thank you for sharing that with me, ${p1}. Every thought and feeling you express is a vital piece of the love story you are writing with ${p2}. 

Could you tell me more about how both of you are feeling about this recently? When you talk about it together, what is the dynamic? I am here to listen with total empathy.` + setupTip;
        }
      }

      return res.json({ reply: replyText });
    }

    // Map client messages to Gemini role structure
    const systemPrompt = userMode === 'single'
      ? `You are "Amour", a deeply empathetic, warm, and romantic AI Love coach and confidence guide.
Your goal is to help single users (such as ${partner1 || 'User'}) who have a crush (named ${partner2 || 'Crush'}) navigate their feelings, formulate gorgeous/creative confession proposals, write sweet text suggestions, overcome shyness/anxiety, and discover signs of mutual liking.
Provide highly personalized ice-breakers, message suggestions, and encouraging love guidance. Maintain a sweet, supportive, confidential, and safe voice. Use clear scannable Markdown formatting with lists and bullet points.`
      : `You are "Amour", a deeply empathetic, warm, and professional AI Love and Relationship Advisor. 
Your goal is to help couples (currently ${partner1 || 'Partner 1'} and ${partner2 || 'Partner 2'}) navigate life's challenges, resolve conflicts constructively, and cherish their emotional bond.
Maintain a gentle, non-judgmental, warm voice. Provide clear, supportive, and practical advice.
When they share conflicts, look at both possible perspectives with high empathy. Use light, scannable Markdown for responses (with clean paragraphs and bullet points).
Always keep privacy and security values high, referencing their bond in a positive and compassionate way.`;

    // Construct contents
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I am here for you. Could you please share more about what is on your mind?";
    return res.json({ reply: replyText });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ 
      error: error.message || "An unexpected error occurred during AI advising.",
      details: "Ensure GEMINI_API_KEY is configured in your environment." 
    });
  }
});

// 2. Comprehensive Relationship Insights Assessment Endpoint
router.post("/assess", async (req, res) => {
  try {
    const { chatHistory, diaryEntries, partner1, partner2, userMode } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not defined. Using high-fidelity assessment fallback.");
    }
    const isSingle = userMode === 'single';

    const couplesContext = isSingle
      ? `User: ${partner1 || 'User'}, Dream Crush: ${partner2 || 'Crush'}`
      : `Partner 1: ${partner1 || 'Partner 1'}, Partner 2: ${partner2 || 'Partner 2'}`;

    const chatsData = (chatHistory || []).map((msg: any) => `${msg.sender === 'user' ? 'User' : 'Amour'}: ${msg.text}`).join("\n");
    const diaryData = (diaryEntries || []).map((entry: any) => `Diary Entry [Mood: ${entry.mood || 'neutral'}]: ${entry.title} - ${entry.content}`).join("\n");

    let analysisPrompt = "";
    if (isSingle) {
      analysisPrompt = `Analyze the feelings and interactions between user ${partner1 || 'User'} and their dream crush ${partner2 || 'Crush'}.
Here are the recent chat conversations with their confidence coach:
${chatsData || '(No recent chat discussions)'}

Here are the secure relationship diary entries regarding their crush:
${diaryData || '(No private entries recorded yet)'}

Based on this, generate:
1. Three core numeric scores (0 to 100) representing:
   - "bondStrength": Target Crush Connection & Openness
   - "communicationScore": Confession Readiness & Confidence Level
   - "emotionalAlignment": Dynamic Sincerity of Feelings
2. An elegant, encouraging "Daily Love Manifestation Affirmation" to boost their confidence.
3. Warm, tailored personal advice letter from Amour on how to build connection and prepare for a genuine confession (maximum 150 words).
4. Extract 1 to 3 positive themes or signals they have described.
5. Generate a comprehensive "Confession Strategy" card. This card must detail:
   - targetCrush: The crush name (${partner2 || 'your crush'}).
   - crushPersonality: Estimated personality vibe based on diaries/custom descriptions.
   - confessionIdea: A beautiful, personalized, high-creative confession plan context (such as writing an intimate physical letter, drawing a star map, or a cozy evening walk scenario).
   - exactMessageSubstances: 2 to 3 tailored message templates they can copy & paste directly (e.g., one sweet/lowkey, one deeply sincere, one cute/playful).
   - mindsetTips: 3 warm, reassuring tips to stay calm, centered, and handle any outcome with deep self-love.

Return this EXACTLY in JSON format fitting this TypeScript schema:
{
  "bondStrength": number,
  "communicationScore": number,
  "emotionalAlignment": number,
  "dailyAffirmation": "string",
  "keyAdvice": "string",
  "recentThemes": ["string", "string"],
  "confessionStrategies": [
    {
      "targetCrush": "string",
      "crushPersonality": "string",
      "confessionIdea": "string",
      "exactMessageSubstances": ["string", "string"],
      "mindsetTips": ["string", "string"]
    }
  ]
}`;
    } else {
      analysisPrompt = `Analyze the relationship data between ${couplesContext}.
Here are the recent chat conversations with their advisor:
${chatsData || '(No recent chat discussions)'}

Here are the secure relationship diary entries:
${diaryData || '(No private entries recorded yet)'}

Based on this, generate:
1. Three core numeric scores (0 to 100) for: Bond Strength, Communication Level, Emotional Alignment.
2. A beautiful, uplifting personalized 'Daily Affirmation' for the couple.
3. Warm, tailored, and actionable relationship advice focusing on their recent challenges (maximum 150 words).
4. Extract 1 to 3 positive recurring themes in their partnership.
5. If there are signs of tension or discussed conflicts, generate a healthy, empathetic "Conflict Resolution Strategy" card. This card must detail:
   - What the perceived issue is.
   - An empathetic analysis of why both partners might feel the way they do (no blame, total compassion).
   - Practical, actionable communication steps they can practice tonight to resolve it.

Return this EXACTLY in JSON format fitting this TypeScript schema:
{
  "bondStrength": number,
  "communicationScore": number,
  "emotionalAlignment": number,
  "dailyAffirmation": "string",
  "keyAdvice": "string",
  "recentThemes": ["string", "string"],
  "conflictStrategies": [
    {
      "issueDescription": "string",
      "empatheticAnalysis": "string",
      "partner1Perspective": "string",
      "partner2Perspective": "string",
      "actionableSteps": ["string", "string"],
      "communicationTips": ["string", "string"]
    }
  ]
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/assess:", error);
    const isSingle = req.body.userMode === 'single';
    if (isSingle) {
      return res.json({
        bondStrength: 65,
        communicationScore: 70,
        emotionalAlignment: 85,
        dailyAffirmation: "Your feelings are real, valid, and beautiful. Approach confession not as a test of self-worth, but as a gift of shared honesty.",
        keyAdvice: "Keep writing your feelings and testing the waters. A casual coffee invitation or a playful chat helps dissolve tension and build familiarity before revealing your heart.",
        recentThemes: ["Sweet Admiration", "Inner Reflection"],
        confessionStrategies: [
          {
            targetCrush: req.body.partner2 || "Crush",
            crushPersonality: "Cozy & Thoughtful",
            confessionIdea: "A heartfelt handwritten card tucked with a small chocolate or coffee treat, combined with an invitation to sit somewhere peaceful.",
            exactMessageSubstances: [
              "Hey " + (req.body.partner2 || 'there') + ", I've really loved our chats lately. You have this amazing warmth to you, and I realized I've developed a bit of a crush on you. I'd love to take you out on a real date to get to know you even better, if you're open to it!",
              "I cherish our connection a lot, and I wanted to be honest with my feelings: you're incredibly special to me. No pressure at all, but I wanted to let you know how much I admire you."
            ],
            mindsetTips: [
              "Remember that being brave enough to share your feelings is a massive victory in itself, regardless of the direct response.",
              "If they are ready to reciprocate, that is wonderful! If they need space or want to stay friends, support their boundary with the same elegance you handle your own heart."
            ]
          }
        ]
      });
    }

    // Return couple fallback
    return res.json({
      bondStrength: 80,
      communicationScore: 75,
      emotionalAlignment: 78,
      dailyAffirmation: "We grow stronger together through open hearts, mutual respect, and gentle listening.",
      keyAdvice: "Continue sharing your little thoughts and daily appreciation with each other. Small moments of communication lay the foundation for a lifetime of trust.",
      recentThemes: ["Empathetic Listening", "Consistent Care"],
      conflictStrategies: [
        {
          issueDescription: "Balancing busy daily schedules with quality one-on-one time.",
          empatheticAnalysis: "Workloads and outer stresses can make both partners feel physically drained, sometimes leading to unintended distance despite having intense love.",
          partner1Perspective: "Seeks reassurance and focused, undistracted quality connection.",
          partner2Perspective: "Wants understanding around busy routines and feels stress about balancing goals.",
          actionableSteps: [
            "Dedicate 15 minutes of device-free 'pillow talk' or tea time every evening just to share feelings, not chores.",
            "Schedule a miniature surprise date-night sequence once a week where chores are strictly off-limits."
          ],
          communicationTips: [
            "Use 'I feel' statements instead of accusing sentences.",
            "Active validate before responding: 'What I hear you saying is that you felt lonely... is that right?'"
          ]
        }
      ]
    });
  }
});

// 3. Secure Couple Bond Image Generation Endpoint
router.post("/generate-bond", async (req, res) => {
  try {
    const { prompt, theme, partner1, partner2, userMode } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not defined. Using adaptive SVG visual fallback.");
    }
    const isSingle = userMode === 'single';

    let customPrompt = "";
    if (isSingle) {
      customPrompt = `A beautiful, sweet, cozy single-mode love manifestation artwork visualizing the dreams of ${partner1 || 'User'} for their secret crush ${partner2 || 'Crush'}.
Theme: ${theme || 'Deep Affection'}.
Scene Description: ${prompt || 'Two delicate souls surrounded by floating cherry blossoms and warm candlelight, a dynamic aesthetic silhouette with soft rose and gold outlines.'}
Art style: Highly aesthetic, artistic minimalist illustration, warm pencil sketch and soft pastel colors, dreamy romantic vibe, high quality. No text, watermark, split-screens, or deformed features.`;
    } else {
      customPrompt = `A beautiful, cozy, symbolic relationship-themed artwork visualizing the bond of a couple named ${partner1 || 'Partner 1'} and ${partner2 || 'Partner 2'}. 
Theme: ${theme || 'Cosmic Bond'}. 
Specific Scene Description: ${prompt || 'Two souls stargazing on top of a hill, soft starry sky, warm bioluminescent lights around them.'}
Art style: Highly aesthetic, artistic minimalist illustration, warm pencil sketch and soft pastel colors, dreamy romantic vibe, high quality. No text, watermark, split-screens, or deformed features.`;
    }

    // Capture visual portraits via image generation API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: customPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Check Parts to find inline image data
    let base64Image = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image part returned in model response candidates.");
    }

    return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });

  } catch (error: any) {
    console.error("Image generation failed in backend:", error.message || error);
    
    // Graceful customized SVG Fallback in case image generation model fails or key is missing
    return res.status(200).json({ 
      imageUrl: "fallback",
      error: error.message || "Model limit, quota, or missing paid API key privileges."
    });
  }
});

export default router;

import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Enhance raw clinical notes using AI
// @route   POST /api/ai/enhance-note
// @access  Private (Doctor, Admin)
export const enhanceClinicalNote = async (req, res, next) => {
  try {
    const { raw_notes } = req.body;

    if (!raw_notes || raw_notes.trim().length < 5) {
      return res.status(400).json({ message: "Raw notes must be at least 5 characters long to enhance." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI Gateway Error: GEMINI_API_KEY is not configured on the server." });
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Strict System Prompt forcing JSON payload
    const systemPrompt = `You are an expert clinical AI assistant. Your job is to take raw, shorthand, or messy notes from a doctor and enhance them into a professional, concise, and structured medical note.
    You are an API. You MUST respond ONLY with a valid, parsable JSON object. Do not include markdown wrappers, backticks, or any conversational text.
    The JSON object must perfectly match this exact schema:
    {
      "enhanced_notes": "The professionally rewritten medical note string here"
    }`;

    const prompt = `${systemPrompt}\n\nRaw Notes to enhance:\n${raw_notes}`;

    // Execute the LLM call
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Safely parse the strict JSON response, stripping markdown just in case
    let aiData;
    try {
      const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      aiData = JSON.parse(cleanedText);
    } catch (parseError) {
      return res.status(500).json({ message: "AI response parsing failed. The model did not return valid JSON." });
    }

    res.status(200).json(aiData);
  } catch (error) {
    next(error); // Forward execution failures to the global error handler
  }
};
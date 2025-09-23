import {onCall, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as admin from "firebase-admin";

interface GenerateAssessmentData {
  age: number;
  grade: string;
}

export const generateVisualAssessment = onCall<GenerateAssessmentData>(async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Only authenticated users can generate assessments.",
      );
    }

    const {age, grade} = request.data;

    if (!age || !grade) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: age, grade.",
      );
    }

    const db = admin.firestore();
    const appConfigDoc = await db.collection('config').doc('app').get();
    if (!appConfigDoc.exists) {
        throw new HttpsError("not-found", "App configuration not found.");
    }
    const subjects = appConfigDoc.data()?.subjects;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        throw new HttpsError("internal", "Subjects not configured in the database.");
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new HttpsError(
        "internal",
        "Gemini API key not configured.",
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});

    const prompt = `
Design a baseline assessment in the form of age-appropriate learning games that align with Cambridge curriculum standards for a child of age ${age} in grade ${grade}.

The games should adapt to different ages, grades, and subjects (e.g., Cambridge Primary, Lower Secondary, IGCSE). The subjects for this assessment are: ${subjects.join(", ")}.

Each game should be fun and interactive while testing key Cambridge skills such as recall, understanding, application, problem-solving, and communication.

For each subject, create at least one example game for the specified grade band.

Provide the output as a JSON object with a single key "games" that contains an array of game objects. Each game object should have the following structure:
{
  "subject": "The subject of the game (e.g., Math, English, Science)",
  "gradeBand": "The Cambridge curriculum grade band (e.g., Primary, Lower Secondary, IGCSE)",
  "title": "The title of the game",
  "description": "A brief description of the game",
  "instructions": "Clear instructions for how to play the game",
  "interaction": "How the learner interacts with the game (e.g., choices, puzzles, storytelling, challenges)",
  "skillsTested": ["An", "array", "of", "skills", "tested"],
  "teacherInterpretation": "How teachers can interpret the results to identify what the learner needs to improve on.",
  "learningOutcomes": ["An", "array", "of", "Cambridge", "learning", "outcomes", "covered"]
}

Do not include any other text or explanation in your response, just the JSON object.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract the JSON from the Markdown code block
      const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ?
        jsonMatch[1] : text.replace(/```json/g, "").replace(/```/g, "").trim();

      // Attempt to parse the text as JSON
      const assessment = JSON.parse(jsonString);

      // Basic validation of the parsed assessment
      if (!assessment.games || !Array.isArray(assessment.games) || assessment.games.length === 0) {
        throw new HttpsError(
          "internal",
          "Gemini did not return a valid array of games.",
        );
      }
      // Optional: Add more detailed validation for each game object

      return {success: true, games: assessment.games};
    } catch (error: any) {
      console.error("Error generating assessment with Gemini:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate assessment questions.",
        error.message,
      );
    }
  });

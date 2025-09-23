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
Generate a visual assessment with 5 questions for a child of age ${age} in grade ${grade}.
The assessment should be a visual matching game.
The questions should cover the following subjects: ${subjects.join(", ")}.
Each question should have a main image and 3 option images. The child needs to select the option image that matches the main image.
Return the assessment as a JSON array of objects. Each object should have the following format:
{
    "questionText": "A simple instruction for the child, e.g., 'Which one is a fruit?'",
    "questionImage": "A placeholder image URL from 'https://placehold.co/150x150?text=...", representing the main image.",
    "subject": "The subject of the question",
    "options": [
        {
            "image": "A placeholder image URL for option 1",
            "isCorrect": true
        },
        {
            "image": "A placeholder image URL for option 2",
            "isCorrect": false
        },
        {
            "image": "A placeholder image URL for option 3",
            "isCorrect": false
        }
    ]
}
Make sure the placeholder text in the image URLs is descriptive of the image content (e.g., 'Apple', 'Car', 'Dog').
Ensure that for each question, exactly one option has "isCorrect" set to true.
Do not include any other text or explanation in your response, just the JSON array.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ?
        jsonMatch[1] : text.replace(/```json/g, "").replace(/```/g, "").trim();

      const questions = JSON.parse(jsonString);

      // No success wrapper, just return the questions array directly
      return questions;
    } catch (error: any) {
      console.error("Error generating assessment with Gemini:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate assessment questions.",
        error.message,
      );
    }
  });

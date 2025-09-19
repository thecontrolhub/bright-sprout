import {onCall, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as admin from "firebase-admin";

interface GenerateAssessmentData {
  age: number;
  grade: string;
  subjects: string[];
  childUid: string;
}

interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const generateBaselineAssessment =
onCall<GenerateAssessmentData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated users can generate assessments.",
    );
  }

  const {age, grade, childUid} = request.data;

  if (!age || !grade || !childUid) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: age, grade, and childUid.",
    );
  }

  const db = admin.firestore();

  // Check if assessment already exists for this child
  const assessmentDocRef = db.collection("baselineAssessments").doc(childUid);
  const assessmentDoc = await assessmentDocRef.get();

  if (assessmentDoc.exists) {
    console.log(`Returning existing baseline assessment for child ${childUid}`);
    return {success: true, questions: assessmentDoc.data()?.questions};
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

  const prompt = `Generate 5 multiple-choice questions for a child who 
  is ${age} years old and in grade ${grade}. The questions should cover 
  general knowledge suitable for their developmental stage. 
  Each question should have 4 options, and one correct answer. 
  Provide the output as a JSON array of objects, where each object has 
  'question', 'options' (an array of strings), and 'correctAnswer' 
  (a string matching one of the options). 
  Example: [{ "question": "What is 2+2?", 
  "options": ["3", "4", "5", "6"], "correctAnswer": "4" }]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the Markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    // Attempt to parse the text as JSON
    const questions: AssessmentQuestion[] = JSON.parse(jsonString);

    // Basic validation of the parsed
    // questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new HttpsError(
        "internal",
        "Gemini did not return a valid array of questions.",
      );
    }
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) ||
      q.options.length === 0 || !q.correctAnswer) {
        throw new HttpsError(
          "internal",
          "Gemini returned malformed question data.",
        );
      }
    }

    // Store the newly generated questions in Firestore
    await assessmentDocRef.set({
      questions: questions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, questions: questions};
  } catch (error: any) {
    console.error("Error generating assessment with Gemini:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate assessment questions.",
      error.message,
    );
  }
});

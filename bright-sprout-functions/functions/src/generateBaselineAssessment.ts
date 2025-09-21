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
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export const generateBaselineAssessment =
  onCall<GenerateAssessmentData>(async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Only authenticated users can generate assessments.",
      );
    }

    const {age, grade, subjects, childUid} = request.data;

    if (!age || !grade || !subjects || !Array.isArray(subjects) || !childUid) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: age, grade, subjects (array), and childUid.",
      );
    }

    const db = admin.firestore();

    // Check if assessment already exists for this child
    const assessmentDocRef = db.collection("baselineAssessments").doc(childUid);
    const assessmentDoc = await assessmentDocRef.get();

    if (assessmentDoc.exists) {
      console.log(`Returning existing baseline
        assessment for child ${childUid}`);
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

    const prompt = `
        Generate a baseline assessment of 10 multiple-choice questions for a 
        child of age ${age} in grade ${grade}.
        The assessment should cover the following 
        subjects: ${subjects.join(", ")}.
        The questions should be appropriate for the child's age and grade level.
        Return the assessment as a JSON array of objects. Each object 
        should have the following format:
        {
            "questionText": "The question",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswerIndex": 0
        }
        Do not include any other text or explanation in 
        your response, just the JSON array.
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
      const questions: AssessmentQuestion[] = JSON.parse(jsonString);

      // Basic validation of the parsed questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new HttpsError(
          "internal",
          "Gemini did not return a valid array of questions.",
        );
      }
      for (const q of questions) {
        if (!q.questionText || !Array.isArray(q.options) ||
          q.options.length === 0 || typeof q.correctAnswerIndex !== "number") {
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

import {onCall, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";

interface GenerateAssessmentData {
  age: number;
  grade: string;
  subjects: string[];
}

interface VisualAssessmentQuestion {
  questionText: string;
  questionShape: string;
  options: {
    shape: string;
    isCorrect: boolean;
  }[];
}

export const generateVisualAssessment =
onCall<GenerateAssessmentData>(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated users can generate assessments.",
    );
  }

  const {age, grade, subjects} = request.data;

  if (!age || !grade || !subjects) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: age, grade, and subjects.",
    );
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

  const prompt = `Generate 3 visual assessment questions for a child aged ${age}
  in grade ${grade}. The questions should be based on the following
  subjects: ${subjects.join(", ")}. Each question should involve matching
  an image to one of three options. Provide the output as a JSON array of
  objects, where each object has 'questionText', 'questionShape', and 'options'
  (an array of objects with 'shape' and 'isCorrect' properties). The
  'questionShape'and 'options.shape' should be valid placeholder image URLs
  from'https://placehold.co/100x100?text=...' with a descriptive text for the
  image.For example, if the image is of a cat, the URL should be
  'https://placehold.co/100x100?text=Cat'.Example:
  [{"questionText":"Match the image!","questionShape":
  "https://placehold.co/100x100?text=QuestionImage",
  "options":[{"shape":"https://placehold.co/100x100?text=Option1","isCorrect":true},
  {"shape":"https://placehold.co/100x100?text=Option2","isCorrect":false},
  {"shape":"https://placehold.co/100x100?text=Option3","isCorrect":false}]}]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;

    const questions: VisualAssessmentQuestion[] =
    JSON.parse(jsonString);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new HttpsError(
        "internal",
        "Gemini did not return a valid array of questions.",
      );
    }
    for (const q of questions) {
      if (!q.questionText || !q.questionShape ||
        !Array.isArray(q.options) || q.options.length === 0) {
        throw new HttpsError(
          "internal",
          "Gemini returned malformed question data.",
        );
      }
    }

    return {success: true, questions: questions};
  } catch (error: any) {
    console.error("Error generating visual assessment with Gemini:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate visual assessment questions.",
      error.message,
    );
  }
});

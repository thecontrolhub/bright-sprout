import {onCall, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as admin from "firebase-admin";

interface LearningPathStep {
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'enrichment';
  activities: string[];
}

interface GameExample {
  subject: string;
  gradeLevel: string;
  title: string;
  instructions: string;
  interaction: string;
  skillsTested: string[];
}

interface LearningCourseModule {
  title: string;
  description: string;
  activities: string[];
  resources: string[]; // URLs or textual resources
}

interface LearningCourse {
  courseTitle: string;
  courseDescription: string;
  modules: LearningCourseModule[];
}

interface AdaptiveAssessmentResponse {
  strengths: string[];
  weaknesses: string[];
  suggestedLearningPath: LearningPathStep[];
  exampleGames: GameExample[];
  resultsToLearningPathMapping: string; // A textual description of how results map to the path
  learningCourse: LearningCourse; // New field
}

interface AnswerRecord {
  questionSubject: string;
  isCorrect: boolean;
  timestamp: string; // Using string for simplicity, can be firestore.Timestamp
}

interface GenerateLearningPathData {
  age: number;
  grade: string;
  performanceHistory: AnswerRecord[];
  childUid: string; // New field
}

export const generateLearningPath = onCall<GenerateLearningPathData>(async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Only authenticated users can generate learning paths.",
      );
    }

    const {age, grade, performanceHistory, childUid} = request.data;

    if (!age || !grade || !performanceHistory || !Array.isArray(performanceHistory) || !childUid) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: age, grade, performanceHistory (array), and childUid.",
      );
    }

    const db = admin.firestore();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new HttpsError(
        "internal",
        "Gemini API key not configured.",
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});

    // Analyze performance history to identify strengths and weaknesses
    const subjectPerformance: { [key: string]: { correct: number; total: number } } = {};
    performanceHistory.forEach(record => {
      if (!subjectPerformance[record.questionSubject]) {
        subjectPerformance[record.questionSubject] = { correct: 0, total: 0 };
      }
      subjectPerformance[record.questionSubject].total++;
      if (record.isCorrect) {
        subjectPerformance[record.questionSubject].correct++;
      }
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    for (const subject in subjectPerformance) {
      const performance = subjectPerformance[subject];
      const percentage = (performance.correct / performance.total) * 100;
      if (percentage >= 70) {
        strengths.push(subject);
      } else if (percentage < 50) {
        weaknesses.push(subject);
      }
    }

    const prompt = `
    You are an adaptive baseline assessment and learning-path designer aligned with Cambridge standards. Your task is to create age-, grade-, and subject-appropriate baseline assessments in the form of interactive games.

    The learner is ${age} years old and in grade ${grade}.
    Based on their recent performance in a quiz:
    Strengths: ${strengths.length > 0 ? strengths.join(', ') : 'None identified'}
    Weaknesses: ${weaknesses.length > 0 ? weaknesses.join(', ') : 'None identified'}

    Requirements:

    The games should be engaging, age-appropriate, and aligned to Cambridge curriculum standards.

    Each game must test different skill areas (recall, understanding, application, problem-solving, communication).

    After analyzing their performance (provided above):

    Identify strengths and weaknesses.

    Suggest a personalized learning path that targets areas for improvement. Focus on subjects in weaknesses, and provide enrichment for strengths.

    Even if the learner answers everything correctly, still recommend a next-step learning path with higher difficulty and enrichment activities.

    The learning path should include progressive steps that gradually increase complexity.

    Output should be a JSON object with the following structure:
    {
      "strengths": string[];
      "weaknesses": string[];
      "suggestedLearningPath": [
        {
          "description": string;
          "difficulty": "easy" | "medium" | "hard" | "enrichment";
          "activities": string[];
        }
      ];
      "exampleGames": [
        {
          "subject": string;
          "gradeLevel": string;
          "title": string;
          "instructions": string;
          "interaction": string;
          "skillsTested": string[];
        }
      ];
      "resultsToLearningPathMapping": string; // A textual description of how results map to the path
      "learningCourse": { // NEW FIELD
        "courseTitle": string;
        "courseDescription": string;
        "modules": [
          {
            "title": string;
            "description": string;
            "activities": string[];
            "resources": string[]; // URLs or textual resources
          }
        ];
      };
    }
    Do not include any other text or explanation in your response, just the JSON object.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ?
        jsonMatch[1] : text.replace(/```json/g, "").replace(/```/g, "").trim();

      const learningPathResponse: AdaptiveAssessmentResponse = JSON.parse(jsonString);

      // Save the generated learning path to Firestore
      const childRef = db.collection('children').doc(childUid);
      await childRef.update({
        learningPath: learningPathResponse,
        learningPathGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return learningPathResponse;
    } catch (error: any) {
      console.error("Error generating learning path with Gemini:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate learning path.",
        error.message,
      );
    }
  });

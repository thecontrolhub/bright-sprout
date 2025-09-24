import React, { useState, useEffect } from 'react';
import { YStack, H2, H3, Paragraph, Spinner, ScrollView, XStack, Button } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChild } from '../app/ChildContext'; // Adjust path as needed
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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

interface Question {
  questionText: string;
  questionImage: string;
  subject: string;
  options: {
    image: string;
    isCorrect: boolean;
  }[];
}

interface BaselineResults {
  score: number;
  totalQuestions: number;
  answers: number[];
  timestamp: string;
}

export default function LearningPathScreen() {
  const { activeChild } = useChild();
  const router = useRouter();
  const { results, areas } = useLocalSearchParams();
  const [learningPath, setLearningPath] = useState<AdaptiveAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const functions = getFunctions();

  useEffect(() => {
    const generatePath = async () => {
      if (!activeChild || !results || !areas) {
        console.error("Missing active child, results, or areas.");
        setIsLoading(false);
        return;
      }

      try {
        const parsedResults: BaselineResults = JSON.parse(results as string);
        const parsedAreas: string[] = JSON.parse(areas as string);

        // Reconstruct performanceHistory from parsedResults and the original questions
        // This requires fetching the original questions from Firestore or passing them
        // For simplicity, let's assume we can reconstruct enough from parsedResults
        // In a real app, you might pass the full questions array or store it with results
        
        // For now, let's create a dummy performance history based on parsedResults
        // This is a placeholder and needs to be refined based on how you store questions
        const performanceHistory = parsedResults.answers.map((answerIndex, qIndex) => {
            // This part is tricky: we don't have the original questions here.
            // We need the original questions to know the subject and correctness.
            // For a real implementation, the VisualAssessmentScreen should pass the questions too,
            // or the LearningPathScreen should fetch them from Firestore.
            // For now, let's use a simplified approach based on areasForImprovement.
            const isCorrect = parsedAreas.includes('subject') ? false : true; // Simplified
            return { 
                questionSubject: parsedAreas[0] || 'General', // Placeholder
                isCorrect: isCorrect,
                timestamp: parsedResults.timestamp,
            };
        });

        // A more robust way would be to pass the questions array from VisualAssessmentScreen
        // router.replace({ pathname: '/LearningPathScreen', params: { results: JSON.stringify(baselineResults), areas: JSON.stringify(uniqueAreasForImprovement), questions: JSON.stringify(questions) } });
        // And then parse it here.

        const generateLearningPathFunction = httpsCallable<{ age: number; grade: string; performanceHistory: any[]; childUid: string }, AdaptiveAssessmentResponse>(functions, 'generateLearningPath');
        const response = await generateLearningPathFunction({
          age: activeChild.age,
          grade: activeChild.grade,
          performanceHistory: performanceHistory, // Pass the reconstructed history
          childUid: activeChild.id, // Pass childUid
        });
        setLearningPath(response.data);

      } catch (error) {
        console.error("Error generating learning path:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generatePath();
  }, [activeChild, results, areas, functions]);

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$orange10" />
        <Paragraph>Generating your personalized learning path...</Paragraph>
      </YStack>
    );
  }

  if (!learningPath) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Paragraph>Could not generate learning path. Please try again.</Paragraph>
        <Button onPress={() => router.replace('/Home')}>Go Home</Button>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack space="$4">
          <H2 fontFamily="$heading" color="$color" textAlign="center">Your Personalized Learning Path</H2>

          {learningPath.strengths.length > 0 && (
            <YStack space="$2" backgroundColor="$green1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$green3">
              <H3 fontFamily="$heading" color="$green10">Strengths:</H3>
              {learningPath.strengths.map((strength, index) => (
                <Paragraph key={index} fontFamily="$body" color="$green10">- {strength}</Paragraph>
              ))}
            </YStack>
          )}

          {learningPath.weaknesses.length > 0 && (
            <YStack space="$2" backgroundColor="$red1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$red3">
              <H3 fontFamily="$heading" color="$red10">Weaknesses:</H3>
              {learningPath.weaknesses.map((weakness, index) => (
                <Paragraph key={index} fontFamily="$body" color="$red10">- {weakness}</Paragraph>
              ))}
            </YStack>
          )}

          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
            <H3 fontFamily="$heading" color="$color">Suggested Learning Path:</H3>
            {learningPath.suggestedLearningPath.map((step, index) => (
              <YStack key={index} space="$1" paddingVertical="$2">
                <Paragraph fontFamily="$body" color="$color" fontWeight="bold">{index + 1}. {step.description} (Difficulty: {step.difficulty})</Paragraph>
                <YStack paddingLeft="$3">
                  {step.activities.map((activity, actIndex) => (
                    <Paragraph key={actIndex} fontFamily="$body" color="$color">- {activity}</Paragraph>
                  ))}
                </YStack>
              </YStack>
            ))}
          </YStack>

          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
            <H3 fontFamily="$heading" color="$color">Example Games:</H3>
            {learningPath.exampleGames.map((game, index) => (
              <YStack key={index} space="$1" paddingVertical="$2">
                <Paragraph fontFamily="$body" color="$color" fontWeight="bold">{game.title} ({game.subject} - {game.gradeLevel})</Paragraph>
                <Paragraph fontFamily="$body" color="$color">  Description: {game.description}</Paragraph>
                <Paragraph fontFamily="$body" color="$color">  Instructions: {game.instructions}</Paragraph>
                <Paragraph fontFamily="$body" color="$color">  Interaction: {game.interaction}</Paragraph>
                <Paragraph fontFamily="$body" color="$color">  Skills Tested: {game.skillsTested.join(', ')}</Paragraph>
              </YStack>
            ))}
          </YStack>

          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
            <H3 fontFamily="$heading" color="$color">Mapping Analysis:</H3>
            <Paragraph fontFamily="$body" color="$color">{learningPath.resultsToLearningPathMapping}</Paragraph>
          </YStack>

          {learningPath.learningCourse && (
            <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
              <H3 fontFamily="$heading" color="$color">Learning Course: {learningPath.learningCourse.courseTitle}</H3>
              <Paragraph fontFamily="$body" color="$color">{learningPath.learningCourse.courseDescription}</Paragraph>
              {learningPath.learningCourse.modules.map((module, modIndex) => (
                <YStack key={modIndex} space="$1" paddingVertical="$2">
                  <Paragraph fontFamily="$body" color="$color" fontWeight="bold">{modIndex + 1}. {module.title}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color">  {module.description}</Paragraph>
                  <YStack paddingLeft="$3">
                    {module.activities.map((activity, actIndex) => (
                      <Paragraph key={actIndex} fontFamily="$body" color="$color">- Activity: {activity}</Paragraph>
                    ))}
                    {module.resources.map((resource, resIndex) => (
                      <Paragraph key={resIndex} fontFamily="$body" color="$color">- Resource: {resource}</Paragraph>
                    ))}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          )}

          <Button onPress={() => router.replace('/Home')} backgroundColor="$blue10" color="white">Go to Home</Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

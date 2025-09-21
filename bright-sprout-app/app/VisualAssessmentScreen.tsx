import React, { useState, useEffect } from 'react';
import { YStack, H2, Paragraph, Spinner, Button, Image, XStack, ScrollView } from 'tamagui';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useChild } from './ChildContext';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../components/CustomHeader';

// Define the structure of a question
interface Question {
  questionText: string;
  questionShape?: string; // Add questionShape here
  options: string[];
  correctAnswerIndex: number;
  subject: string;
}

export default function VisualAssessmentScreen() {
  const { activeChild, updateBaselineAssessmentStatus } = useChild();
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const functions = getFunctions();

  useEffect(() => {
    const generateAssessment = async () => {
      if (!activeChild) {
        return;
      }
      setIsLoading(true); // Start loading

      try {
        const childRef = doc(db, 'children', activeChild.id);
        const childDoc = await getDoc(childRef);
        const childData = childDoc.data();

        if (childData && childData.baselineAssessment) {
          // Load existing baseline
          setQuestions(childData.baselineAssessment);
          setIsLoading(false);
          return; // Exit as baseline is loaded
        }

        // If no baseline, generate a new one
        const generateAssessmentFunction = httpsCallable<{ age: number; grade: string; subjects: string[] }, { questions: any[] }>(functions, 'generateVisualAssessment');
        const result = await generateAssessmentFunction({
          age: activeChild.age,
          grade: activeChild.grade,
          subjects: ['visual'],
        });
        const assessment = result.data;

        if (assessment && assessment.questions) {
          const transformedQuestions = assessment.questions.map((q: any) => {
            const correctAnswerIndex = q.options.findIndex((opt: any) => opt.isCorrect);
            return {
              questionText: q.questionText,
              questionShape: q.questionShape,
              options: q.options.map((opt: any) => opt.shape),
              correctAnswerIndex: correctAnswerIndex,
              subject: q.subject,
            };
          });
          setQuestions(transformedQuestions);

          // Save the newly generated baseline to Firestore
          await updateDoc(childRef, {
            baselineAssessment: transformedQuestions,
          });

        } else {
          console.error("Assessment data or questions are missing.");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error generating assessment:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false); // End loading
      }
    };

    if (activeChild) {
      generateAssessment();
    }
  }, [activeChild, functions]);

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === optionIndex;
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        finishAssessment(newAnswers);
      }
    }, 1000);
  };

  const finishAssessment = async (finalAnswers: number[]) => {
    setIsFinishing(true);
    const areasForImprovement: string[] = [];
    questions.forEach((question, index) => {
      if (question.correctAnswerIndex !== finalAnswers[index]) {
        areasForImprovement.push(question.subject);
      }
    });

    const uniqueAreasForImprovement = [...new Set(areasForImprovement)];

    if (activeChild) {
      try {
        const childRef = doc(db, 'children', activeChild.id);
        const baselineResults = {
          score: score,
          answers: finalAnswers,
          timestamp: new Date().toISOString(), // Save a timestamp
        };
        await updateDoc(childRef, {
          areasForImprovement: arrayUnion(...uniqueAreasForImprovement),
          baselineResults: baselineResults, // Add this line
        });
        await updateBaselineAssessmentStatus(activeChild.id, true, score);
        router.replace('/Home');
      } catch (error) {
        console.error("Error finishing assessment:", error);
      } finally {
        setIsFinishing(false);
      }
    } else {
      setIsFinishing(false);
    }
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$orange10" />
        <Paragraph>Loading Assessment...</Paragraph>
      </YStack>
    );
  }

  if (isFinishing) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$orange10" />
        <Paragraph>Generating Baseline...</Paragraph>
      </YStack>
    );
  }

  if (questions.length === 0) {
    return (
        <YStack flex={1} justifyContent="center" alignItems="center">
            <Paragraph>Could not load questions. Please check the console for more information.</Paragraph>
        </YStack>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} alignItems="center" space="$4" padding="$4" backgroundColor="$background">
          <H2 fontFamily="$heading" color="$color">Visual Assessment</H2>
          <Paragraph fontFamily="$body" color="$color">Score: {score}</Paragraph>
          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3" width="100%">
            <Paragraph fontFamily="$body" color="$color" fontSize="$5" textAlign="center">{currentQuestion.questionText}</Paragraph>
            {currentQuestion.questionShape && (
              <Image
                source={{ uri: currentQuestion.questionShape, width: 150, height: 150 }}
                alt="Question Image"
                borderRadius="$3"
                marginVertical="$3"
              />
            )}
          </YStack>
          <XStack space="$4" flexWrap="wrap" justifyContent="center">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === index;
              const borderColor = isSelected ? (isCorrect ? '$green9' : '$red9') : '$gray7';
              const backgroundColor = isSelected ? (isCorrect ? '$green3' : '$red3') : '$gray2';

              return (
                <Button
                  key={index}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  borderColor={borderColor}
                  borderWidth={2}
                  backgroundColor={backgroundColor}
                  borderRadius="$4"
                  padding="$3"
                  marginVertical="$2"
                  width={120}
                  height={120}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Image source={{ uri: option, width: 100, height: 100 }} />
                </Button>
              );
            })}
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
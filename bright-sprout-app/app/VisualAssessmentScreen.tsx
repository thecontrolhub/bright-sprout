import React, { useState, useEffect } from 'react';
import { YStack, H2, Paragraph, Spinner, Button, Image, XStack, ScrollView } from 'tamagui';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useChild } from './ChildContext';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the structure of a question
interface Question {
  questionText: string;
  questionImage: string;
  subject: string;
  options: {
    image: string;
    isCorrect: boolean;
  }[];
}

export default function VisualAssessmentScreen() {
  const { activeChild, updateBaselineAssessmentStatus } = useChild();
  const router = useRouter();
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
      setIsLoading(true);

      try {
        const childRef = doc(db, 'children', activeChild.id);
        const childDoc = await getDoc(childRef);
        const childData = childDoc.data();

        if (childData && childData.baselineResults) {
          // Assessment is already complete, redirect to home.
          router.replace('/Home');
          return;
        }

        // Data validation check
        const isValidAssessment = 
          childData && 
          childData.baselineAssessment && 
          Array.isArray(childData.baselineAssessment) && 
          childData.baselineAssessment.length > 0 && 
          childData.baselineAssessment[0].questionText &&
          childData.baselineAssessment[0].options;

        if (isValidAssessment) {
          setQuestions(childData.baselineAssessment);
        } else {
          // If data is invalid or doesn't exist, generate a new assessment
          const generateAssessmentFunction = httpsCallable<{ age: number; grade: string; }, Question[]>(functions, 'generateVisualAssessment');
          const result = await generateAssessmentFunction({
            age: activeChild.age,
            grade: activeChild.grade,
          });
          const newQuestions = result.data;

          if (newQuestions && Array.isArray(newQuestions)) {
            setQuestions(newQuestions);
            // Overwrite the old invalid assessment data
            await updateDoc(childRef, {
              baselineAssessment: newQuestions,
            });
          } else {
            console.error("Received invalid question data from backend.");
            setQuestions([]);
          }
        }
      } catch (error) {
        console.error("Error processing assessment:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeChild) {
      generateAssessment();
    }
  }, [activeChild, functions]);

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer

    setSelectedAnswer(optionIndex);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[optionIndex].isCorrect;

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
    }, 300); // Reduced delay
  };

  const finishAssessment = async (finalAnswers: number[]) => {
    setIsFinishing(true);
    const areasForImprovement: string[] = [];
    questions.forEach((question, index) => {
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
      if (correctOptionIndex !== finalAnswers[index]) {
        areasForImprovement.push(question.subject);
      }
    });

    const uniqueAreasForImprovement = [...new Set(areasForImprovement)];

    if (activeChild) {
      try {
        const childRef = doc(db, 'children', activeChild.id);
        const baselineResults = {
          score: score,
          totalQuestions: questions.length,
          answers: finalAnswers,
          timestamp: new Date().toISOString(),
        };
        await updateDoc(childRef, {
          areasForImprovement: arrayUnion(...uniqueAreasForImprovement),
          baselineResults: baselineResults,
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
        <Paragraph>Calculating Results...</Paragraph>
      </YStack>
    );
  }
  
  if (questions.length === 0) {
    return (
        <YStack flex={1} justifyContent="center" alignItems="center">
            <Paragraph>Could not load questions. Please try again later.</Paragraph>
        </YStack>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} alignItems="center" space="$4" padding="$4" backgroundColor="$background">
          <H2 fontFamily="$heading" color="$color">Visual Assessment</H2>
          <Paragraph fontFamily="$body" color="$color">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Paragraph>
          
          <YStack space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3" width="100%" alignItems="center">
            <Paragraph fontFamily="$body" color="$color" fontSize="$5" textAlign="center">{currentQuestion.questionText}</Paragraph>
            {currentQuestion.questionImage && (
              <Image
                source={{ uri: currentQuestion.questionImage, width: 150, height: 150 }}
                alt="Question Image"
                borderRadius="$3"
                marginVertical="$3"
              />
            )}
          </YStack>

          <XStack space="$4" flexWrap="wrap" justifyContent="center">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const borderColor = isSelected ? '$blue9' : '$gray7';
              const backgroundColor = isSelected ? '$blue3' : '$gray2';

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
                  <Image source={{ uri: option.image, width: 100, height: 100 }} />
                </Button>
              );
            })}
          </XStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useState, useEffect } from 'react';
import { YStack, H2, Paragraph, Spinner, Button, Image, XStack } from 'tamagui';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useChild } from './ChildContext';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Define the structure of a question
interface Question {
  questionText: string;
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
  const functions = getFunctions();

  useEffect(() => {
    const generateAssessment = async () => {
      if (!activeChild) {
        return;
      }
      try {
        setIsLoading(true);
        const generateAssessmentFunction = httpsCallable<{ age: number; grade: string; subjects: string[] }, { questions: any[] }>(functions, 'generateVisualAssessment');
        const result = await generateAssessmentFunction({
          age: activeChild.age,
          grade: activeChild.grade,
          subjects: ['visual'],
        });
        const assessment = result.data;

        if (assessment && assessment.questions) {
          const transformedQuestions = assessment.questions.map((q) => {
            const correctAnswerIndex = q.options.findIndex((opt: any) => opt.isCorrect);
            return {
              questionText: q.questionText,
              options: q.options.map((opt: any) => opt.shape),
              correctAnswerIndex: correctAnswerIndex,
              subject: q.subject,
            };
          });
          setQuestions(transformedQuestions);
        } else {
          console.error("Assessment data or questions are missing.");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error generating assessment:", error);
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
    const areasForImprovement: string[] = [];
    questions.forEach((question, index) => {
      if (question.correctAnswerIndex !== finalAnswers[index]) {
        areasForImprovement.push(question.subject);
      }
    });

    const uniqueAreasForImprovement = [...new Set(areasForImprovement)];

    if (activeChild) {
      const childRef = doc(db, 'children', activeChild.id);
      await updateDoc(childRef, {
        areasForImprovement: arrayUnion(...uniqueAreasForImprovement),
      });
      await updateBaselineAssessmentStatus(activeChild.id, true, score);
      router.replace('/Home');
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

  if (questions.length === 0) {
    return (
        <YStack flex={1} justifyContent="center" alignItems="center">
            <Paragraph>Could not load questions. Please check the console for more information.</Paragraph>
        </YStack>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" space="$4" padding="$4">
      <H2>Visual Assessment</H2>
      <Paragraph>Score: {score}</Paragraph>
      <Paragraph>{currentQuestion.questionText}</Paragraph>
      <XStack space="$4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === index;
          const borderColor = isSelected ? (isCorrect ? '$green10' : '$red10') : '$gray10';

          return (
            <Button key={index} onPress={() => handleAnswer(index)} disabled={selectedAnswer !== null} borderColor={borderColor} borderWidth={2}>
              <Image source={{ uri: option, width: 100, height: 100 }} />
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
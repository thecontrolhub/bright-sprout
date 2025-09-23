import React, { useState, useEffect } from 'react';
import { YStack, H2, H3, Paragraph, Spinner, Button, ScrollView } from 'tamagui';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useChild } from './ChildContext';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the structure of a Game
interface Game {
  subject: string;
  gradeBand: string;
  title: string;
  description: string;
  instructions: string;
  interaction: string;
  skillsTested: string[];
  teacherInterpretation: string;
  learningOutcomes: string[];
}

export default function VisualAssessmentScreen() {
  const { activeChild, updateBaselineAssessmentStatus } = useChild();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        if (childData && childData.baselineAssessment) {
          setGames(childData.baselineAssessment);
        } else {
          const generateAssessmentFunction = httpsCallable<{ age: number; grade: string; }, { games: Game[] }>(functions, 'generateVisualAssessment');
          const result = await generateAssessmentFunction({
            age: activeChild.age,
            grade: activeChild.grade,
          });
          const assessment = result.data;

          if (assessment && assessment.games) {
            setGames(assessment.games);
            await updateDoc(childRef, {
              baselineAssessment: assessment.games,
            });
          } else {
            console.error("Assessment data or games are missing.");
            setGames([]);
          }
        }
      } catch (error) {
        console.error("Error generating assessment:", error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeChild) {
      generateAssessment();
    }
  }, [activeChild, functions]);

  const finishAssessment = async () => {
    setIsFinishing(true);
    if (activeChild) {
      try {
        await updateBaselineAssessmentStatus(activeChild.id, true, 0); // Score is 0 for now
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
        <Paragraph>Generating Assessment Games...</Paragraph>
      </YStack>
    );
  }

  if (isFinishing) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$orange10" />
        <Paragraph>Finalizing Assessment...</Paragraph>
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} alignItems="center" space="$4" padding="$4" backgroundColor="$background">
          <H2 fontFamily="$heading" color="$color">Baseline Assessment Games</H2>
          {games.length > 0 ? (
            <YStack width="100%" space="$4">
              {games.map((game, index) => (
                <YStack key={index} space="$2" backgroundColor="$gray1" padding="$4" borderRadius="$4" shadow="$md" borderWidth="$0.5" borderColor="$gray3">
                  <H3 fontFamily="$heading" color="$color">{game.title}</H3>
                  <Paragraph fontFamily="$body" color="$color"><strong>Subject:</strong> {game.subject}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Grade Band:</strong> {game.gradeBand}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Description:</strong> {game.description}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Instructions:</strong> {game.instructions}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Interaction:</strong> {game.interaction}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Skills Tested:</strong> {game.skillsTested.join(', ')}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Teacher Interpretation:</strong> {game.teacherInterpretation}</Paragraph>
                  <Paragraph fontFamily="$body" color="$color"><strong>Learning Outcomes:</strong> {game.learningOutcomes.join(', ')}</Paragraph>
                </YStack>
              ))}
              <Button onPress={finishAssessment} backgroundColor="$green10" color="white">Complete Assessment</Button>
            </YStack>
          ) : (
            <Paragraph>Could not load assessment games. Please try again later.</Paragraph>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

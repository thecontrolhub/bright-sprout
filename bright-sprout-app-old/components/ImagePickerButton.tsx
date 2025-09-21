import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Button, Paragraph } from 'tamagui';
import { Alert } from 'react-native';

interface ImagePickerButtonProps {
  onImagePicked: (uri: string) => void;
}

export default function ImagePickerButton({ onImagePicked }: ImagePickerButtonProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  return (
    <Button onPress={pickImage} chromeless>
      <Paragraph color="$blue8" fontSize="$4" fontWeight="bold">
        Change Profile Picture
      </Paragraph>
    </Button>
  );
}

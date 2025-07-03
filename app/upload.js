import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';

export default function UploadScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch('http://192.168.254.102:8000/predict/', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) throw new Error('Prediction failed');
      const result = await response.json();

      // Prepare resultData for history
      const resultData = {
        id: uuid.v4(),
        date: new Date().toLocaleString(),
        image,
        result: {
          class: result.class,
          confidence: result.confidence,
          all_probs: {
            Ripe: result.class === 'Ripe' ? result.confidence : 1 - result.confidence,
            Overripe: result.class === 'Overripe' ? result.confidence : 1 - result.confidence,
          },
        },
      };

      const existing = await AsyncStorage.getItem('history');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [resultData, ...parsed];
      await AsyncStorage.setItem('history', JSON.stringify(updated));

      setLoading(false);

      router.push(
        `/result?image=${encodeURIComponent(image)}&class=${result.class}&confidence=${result.confidence}&ripe=${resultData.result.all_probs.Ripe}&overripe=${resultData.result.all_probs.Overripe}`
      );
    } catch (err) {
      setLoading(false);
      alert('Error analyzing image: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📤 Upload or Take a Photo</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Use Camera</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
          resizeMode="contain"
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
      ) : (
        image && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.chooseAgainButton} onPress={() => setImage(null)}>
              <Text style={styles.analyzeText}>Choose Another</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
              <Text style={styles.analyzeText}>Analyze</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    gap: 10,
  },
  chooseAgainButton: {
    backgroundColor: '#9ca3af',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  analyzeButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  analyzeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
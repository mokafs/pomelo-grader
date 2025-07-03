import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ResultScreen() {
  const {
    image: rawImage,
    class: predictionClass,
    confidence,
    ripe,
    overripe,
  } = useLocalSearchParams();

  const image = decodeURIComponent(rawImage);
  const router = useRouter();

  const confidenceData = [
    { label: 'Ripe', value: parseFloat(ripe) },
    { label: 'Overripe', value: parseFloat(overripe) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📈 Prediction Result</Text>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      <View style={styles.card}>
        <Text style={styles.predicted}>
          <Text style={styles.predictedLabel}>Predicted:</Text>{' '}
          <Text style={styles.predictedClass}>{predictionClass}</Text>
        </Text>
        <Text style={styles.confidence}>
          Confidence: {(parseFloat(confidence) * 100).toFixed(1)}%
        </Text>

        {confidenceData.map((item) => (
          <View key={item.label} style={{ marginTop: 12 }}>
            <Text style={styles.barLabel}>
              {item.label} - {(item.value * 100).toFixed(1)}%
            </Text>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(item.value * 100).toFixed(1)}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/upload')}
      >
        <Text style={styles.buttonText}>Scan Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f4f6',
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  predicted: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#374151',
  },
  predictedLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  predictedClass: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confidence: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  barBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  barFill: {
    height: 10,
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
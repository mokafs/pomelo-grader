import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-gesture-handler';


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🍈 PomeGrade</Text>
      <Text style={styles.subtitle}>Welcome to your Pomelo Grading Assistant</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/upload')}
      >
        <Text style={styles.buttonText}>Start Grading</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/history')}
        style={styles.link}
      >
        <Text style={styles.linkText}>📜 View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 24 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#4b5563', marginBottom: 32, textAlign: 'center' },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 12 },
  linkText: { color: '#2563eb', fontSize: 14, fontWeight: '500' },
});

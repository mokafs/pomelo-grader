import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563eb',
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="upload" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="result"
          options={{
            title: 'Result',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="check-circle" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="history" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

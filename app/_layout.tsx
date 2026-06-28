import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '⭐',
    add: '➕',
  };
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icons[name]}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#0D0D0D' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 20, letterSpacing: 2 },
          tabBarStyle: {
            backgroundColor: '#0D0D0D',
            borderTopColor: '#1E1E1E',
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#555',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'PRO',
            tabBarLabel: 'PRODUCTS',
            tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'ADD PRODUCT',
            tabBarLabel: 'ADD',
            tabBarIcon: ({ focused }) => <TabIcon name="add" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="product/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, opacity: 0.4 },
  iconActive: { opacity: 1 },
});

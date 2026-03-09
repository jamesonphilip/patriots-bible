import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography, Spacing } from '../theme';
import ReadScreen from '../screens/ReadScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import HighlightsScreen from '../screens/HighlightsScreen';
import NotesScreen from '../screens/NotesScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="ReadTab"
          component={ReadScreen}
          options={{
            tabBarLabel: 'Read',
            tabBarIcon: ({ focused }) => <TabIcon label="Read" emoji="📖" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ focused }) => <TabIcon label="Search" emoji="🔍" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="BookmarksTab"
          component={BookmarksScreen}
          options={{
            tabBarLabel: 'Bookmarks',
            tabBarIcon: ({ focused }) => <TabIcon label="Bookmarks" emoji="🔖" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="HighlightsTab"
          component={HighlightsScreen}
          options={{
            tabBarLabel: 'Highlights',
            tabBarIcon: ({ focused }) => <TabIcon label="Highlights" emoji="🖊" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="NotesTab"
          component={NotesScreen}
          options={{
            tabBarLabel: 'Notes',
            tabBarIcon: ({ focused }) => <TabIcon label="Notes" emoji="📝" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.navy,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: Typography.uiFamily,
    fontSize: 10,
  },
});

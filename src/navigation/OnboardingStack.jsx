import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import CreateFamilyScreen from '../screens/Onboarding/CreateFamilyScreen';
import JoinFamilyScreen from '../screens/Onboarding/JoinFamilyScreen';

const Stack = createNativeStackNavigator();

// As per section 3.0, OnboardingStack holds Welcome, Create, and Join
const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateFamily" component={CreateFamilyScreen} />
      <Stack.Screen name="JoinFamily" component={JoinFamilyScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
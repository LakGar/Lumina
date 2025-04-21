import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "./types";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import IdentityScreen from "../screens/onboarding/IdentityScreen";
import JournalingStyleScreen from "../screens/onboarding/JournalingStyleScreen";
import GoalsScreen from "../screens/onboarding/GoalsScreen";
import DailyRitualScreen from "../screens/onboarding/DailyRitualScreen";
import CompleteScreen from "../screens/onboarding/CompleteScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Identity" component={IdentityScreen} />
      <Stack.Screen name="JournalingStyle" component={JournalingStyleScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="DailyRitual" component={DailyRitualScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}

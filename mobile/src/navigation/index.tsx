import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import { RootStackParamList } from "./types";
import { ActivityIndicator, AppState, View } from "react-native";
import OnboardingStack from "./OnboardingStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {signed ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="Onboarding" component={OnboardingStack} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

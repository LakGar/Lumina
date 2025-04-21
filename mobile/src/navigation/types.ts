import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  AuthScreen: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Explore: undefined;
  Journey: undefined;
  Trends: undefined;
  Add: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Identity: undefined;
  JournalingStyle: undefined;
  Goals: undefined;
  Reflection: undefined;
  DailyRitual: undefined;
  Complete: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: NavigatorScreenParams<AppTabParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
};

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Explore from "../screens/Explore";
import Journey from "../screens/Journey";
import Trends from "../screens/Trends";
import Add from "../screens/Add";
import { AppTabParamList } from "./types";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7877d6",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#111011",
          borderTopWidth: 0,
          height: 90,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={Add}
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                backgroundColor: "#7877d6",
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Journey"
        component={Journey}
        options={{
          tabBarLabel: "Journey",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trends"
        component={Trends}
        options={{
          tabBarLabel: "Trends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

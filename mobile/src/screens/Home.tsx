import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import Header from "../components/Header";
import Greetings from "../components/Home/Greetings";
import WeekCalendar from "../components/WeekCalendar";
import SmartPrompt from "../components/Home/SmartPrompt";
import YesterdayMood from "../components/Home/YesterdayMood";
import RecentEntries from "../components/Home/RecentEntries";
import DailyQuote from "../components/Home/DailyQuote";

const Home = () => {
  return (
    <View style={styles.container}>
      <Header title="Home" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Greetings />
        <WeekCalendar />
        <SmartPrompt />
        <YesterdayMood />
        <RecentEntries />
        <DailyQuote />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    paddingTop: 130,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    width: "100%",
    paddingHorizontal: 20,
  },
});

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Header from "../components/Header";
import Streak from "../components/trends/Streak";
import Stats from "../components/trends/Stats";
import CalendarView from "../components/trends/Calender";
export default function Trends() {
  return (
    <View style={styles.container}>
      <Header title="Trends" />

      <ScrollView style={{ flex: 1, width: "100%" }}>
        <Streak />
        <Stats />
        <CalendarView />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    alignItems: "center",
    paddingTop: 130,
  },
});

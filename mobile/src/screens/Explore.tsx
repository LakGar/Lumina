import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Header from "../components/Header";
import FeaturedPrompts from "../components/Explore/FeaturedPrompts";
import TopicsGrid from "../components/Explore/TopicsGrid";
import SavedPrompts from "../components/Explore/SavedPrompts";

export default function Explore() {
  return (
    <View style={styles.container}>
      <Header title="Explore" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FeaturedPrompts />
        <TopicsGrid />
        <SavedPrompts />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    paddingTop: 130,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
});

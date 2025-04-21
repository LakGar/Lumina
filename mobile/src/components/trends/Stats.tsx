import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const GRAPH_HEIGHT = 70;
const Y_AXIS_STEPS = 3;

const Stats = () => {
  // Mock data - replace with real data later
  const monthlyData = [30, 13, 29, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const totalEntries = monthlyData.reduce((sum, count) => sum + count, 0);

  // Calculate the y-axis scale dynamically
  const { maxValue, yAxisLabels } = useMemo(() => {
    const max = Math.max(...monthlyData);
    // Round up to the nearest multiple of Y_AXIS_STEPS
    const roundedMax = Math.ceil(max / Y_AXIS_STEPS) * Y_AXIS_STEPS;
    const labels = Array.from({ length: Y_AXIS_STEPS }, (_, i) =>
      Math.round((roundedMax / (Y_AXIS_STEPS - 1)) * (Y_AXIS_STEPS - 1 - i))
    );
    return { maxValue: roundedMax, yAxisLabels: labels };
  }, [monthlyData]);

  const renderBars = () => {
    return monthlyData.map((value, index) => {
      const height = (value / maxValue) * GRAPH_HEIGHT;
      const isCurrentMonth = index === new Date().getMonth();
      return (
        <View key={index} style={styles.barContainer}>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                { height: Math.max(height, 0) },
                value > 0 && styles.activeBar,
              ]}
            />
            <View style={[styles.dot, value > 0 && styles.activeDot]} />
          </View>
          <Text
            style={[
              styles.monthLabel,
              isCurrentMonth && styles.currentMonthLabel,
            ]}
          >
            {MONTHS[index]}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats</Text>
      <LinearGradient
        colors={["rgba(106,53,177, 0.95)", "rgba(34,13,39, 0.9)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.leftSection}>
          <Text style={styles.entryCount}>{totalEntries}</Text>
          <Text style={styles.entryLabel}>
            {totalEntries === 1 ? "Entry" : "Entries"}
          </Text>
          <Text style={styles.yearLabel}>This Year</Text>
        </View>
        <View style={styles.graphSection}>
          <View style={styles.graph}>
            <View style={styles.horizontalLines}>
              {yAxisLabels.map((_, index) => (
                <View key={index} style={styles.horizontalLine} />
              ))}
            </View>
            <View style={styles.barsContainer}>{renderBars()}</View>
          </View>
          <View style={styles.yAxisLabels}>
            {yAxisLabels.map((label, index) => (
              <Text key={index} style={styles.yAxisText}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.15)",
    shadowColor: "#B4A7D6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 140,
  },
  leftSection: {
    justifyContent: "flex-start",
  },
  entryCount: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    lineHeight: 60,
  },
  entryLabel: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  yearLabel: {
    fontSize: 14,
    color: "white",
    opacity: 0.5,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  graphSection: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 8,
  },
  graph: {
    flex: 1,
    height: GRAPH_HEIGHT + 30, // Add space for month labels
  },
  horizontalLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: GRAPH_HEIGHT,
    justifyContent: "space-between",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    height: GRAPH_HEIGHT,
    marginBlock: 4,
    zIndex: 100,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 1.25,
  },
  activeBar: {
    backgroundColor: "#B4A7D6",
    width: 3,
    borderRadius: 1.5,
    shadowColor: "#B4A7D6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 4,
  },
  activeDot: {
    backgroundColor: "#B4A7D6",
    shadowColor: "#B4A7D6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  yAxisLabels: {
    marginLeft: 8,
    justifyContent: "space-between",
    height: GRAPH_HEIGHT,
  },
  yAxisText: {
    color: "white",
    opacity: 0.3,
    fontSize: 12,
    textAlign: "left",
    width: 24,
    fontWeight: "500",
  },
  monthLabel: {
    color: "white",
    opacity: 0.3,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  currentMonthLabel: {
    opacity: 0.7,
    fontWeight: "600",
  },
});

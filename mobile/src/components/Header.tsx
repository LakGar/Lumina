import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  Animated,
  Pressable,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const Header = ({ title }: { title: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1744179211676-f0536705fcd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMnx8fGVufDB8fHx8fA%3D%3D",
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#111011",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    width: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 100,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#7877d6",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});

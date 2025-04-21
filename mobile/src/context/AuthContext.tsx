import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedUser = await AsyncStorage.getItem("@Lumina:user");
      const storedToken = await AsyncStorage.getItem("@Lumina:token");

      if (storedUser && storedToken) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await AsyncStorage.setItem("@Lumina:user", JSON.stringify(userData));
      await AsyncStorage.setItem("@Lumina:token", token);

      setUser(userData);
    } catch (error) {
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    try {
      const response = await axios.post("http://localhost:3000/auth/signup", {
        email,
        password,
        firstName,
        lastName,
      });

      const { token, user: userData } = response.data;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await AsyncStorage.setItem("@Lumina:user", JSON.stringify(userData));
      await AsyncStorage.setItem("@Lumina:token", token);

      setUser(userData);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem("@Lumina:user");
      await AsyncStorage.removeItem("@Lumina:token");
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

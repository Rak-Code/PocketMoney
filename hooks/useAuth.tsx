"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  totalWallet: number;
  monthlyPocketMoney: number;
  autoAddEnabled: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user: any, additionalData?: Partial<UserData>) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName ?? user.email?.split("@")[0] ?? "User",
        totalWallet: 0,
        monthlyPocketMoney: 0,
        autoAddEnabled: false,
        ...additionalData
      };

      await setDoc(userRef, userData);
      return userData;
    }

    return userSnap.data() as UserData;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = await createUserDocument(result.user);
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error("Google login error:", error);
      return { success: false, error: error.message };
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(result.user, { displayName });
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error("Email registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getDoc(doc(db, "users", result.user.uid));
      if (userData.exists()) {
        setUser(userData.data() as UserData);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Email login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  };
}

"use client";
import { useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function AddTopupForm() {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!user || !amt) return;
    await addDoc(collection(db, "topups"), {
      amount: amt,
      userId: user.uid,
      date: serverTimestamp(),
      source: "Manual Add",
    });
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      totalWallet: increment(amt),
    });
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        placeholder="Top-up Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-xl">Add Money</button>
    </form>
  );
}

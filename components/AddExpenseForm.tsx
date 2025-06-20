"use client";
import { useState } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AddExpenseForm() {
  const [form, setForm] = useState({ title: "", category: "", amount: 0, notes: "" });
  const { user } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount.toString());
    if (!user || !amount || !form.title || !form.category) return;
    const expenseRef = collection(db, "expenses");
    await addDoc(expenseRef, {
      ...form,
      amount,
      userId: user.uid,
      date: serverTimestamp(),
    });
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      totalWallet: increment(-amount),
    });
    setForm({ title: "", category: "", amount: 0, notes: "" });
    router.refresh && router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="input" />
      <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required className="input" />
      <select name="category" value={form.category} onChange={handleChange} required className="input">
        <option value="">Select Category</option>
        <option>Food</option>
        <option>Shopping</option>
        <option>Travel</option>
        <option>Entertainment</option>
      </select>
      <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="input" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl">Add Expense</button>
    </form>
  );
}

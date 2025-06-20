"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, Timestamp } from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

interface AddExpenseModalProps {
  open: boolean
  onClose: () => void
}

export function AddExpenseModal({ open, onClose }: AddExpenseModalProps) {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(getCurrentDate())
  const [notes, setNotes] = useState("")
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const categories = ["Food", "Travel", "Entertainment", "Shopping", "Bills", "Health", "Other"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !date || !title || !user) {
      alert("Please fill in all required fields!")
      return
    }

    setLoading(true)

    const amt = Number.parseFloat(amount)

    try {
      await addDoc(collection(db, "expenses"), {
        title,
        amount: amt,
        category,
        date: Timestamp.fromDate(new Date(date)),
        notes,
        userId: user.uid,
        createdAt: serverTimestamp(),
      })

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { totalWallet: increment(-amt) })

      setAmount("")
      setCategory("")
      setDate(getCurrentDate())
      setNotes("")
      setTitle("");
      onClose()
    } catch (err) {
      alert("Failed to add expense")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Record a new expense to track your spending.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

        

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
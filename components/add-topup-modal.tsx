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
import { collection, addDoc, doc, updateDoc, serverTimestamp, increment } from "firebase/firestore"
import { useAuth } from "@/hooks/useAuth"

interface AddTopupModalProps {
  open: boolean
  onClose: () => void
}

export function AddTopupModal({ open, onClose }: AddTopupModalProps) {
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const sources = ["Monthly", "Manual", "Gift", "Bonus", "Other"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !source || !user) {
      alert("Please fill in all required fields!")
      return
    }

    setLoading(true)

    const amt = Number.parseFloat(amount)

    try {
      await addDoc(collection(db, "topups"), {
        amount: amt,
        source,
        notes,
        userId: user.uid,
        date: serverTimestamp(),
      })

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { totalWallet: increment(amt) })

      // Reset form
      setAmount("")
      setSource("")
      setNotes("")
      onClose()
    } catch (err) {
      alert("Failed to add top-up")
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Money to Wallet</DialogTitle>
          <DialogDescription>Add money to your wallet from various sources.</DialogDescription>
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
            <Label htmlFor="source">Source *</Label>
            <Select value={source} onValueChange={setSource} required>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((src) => (
                  <SelectItem key={src} value={src}>
                    {src}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {loading ? "Adding..." : "Add Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

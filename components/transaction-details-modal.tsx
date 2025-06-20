"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, Calendar, Tag, FileText } from "lucide-react"

interface TransactionDetailsModalProps {
  open: boolean
  onClose: () => void
  transaction: any
}

export function TransactionDetailsModal({ open, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.type === "expense" ? (
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
            ) : (
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
            )}
            {transaction.title}
          </DialogTitle>
          <DialogDescription>Transaction details and information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Amount</span>
            <span className={`text-lg font-bold ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}>
              {transaction.type === "expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </span>
            <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {transaction.type === "expense" ? "Category" : "Source"}
            </span>
            <Badge variant="outline" className="bg-background text-foreground">
              {transaction.category || transaction.source}
            </Badge>
          </div>

          {transaction.notes && (
            <div className="space-y-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </span>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{transaction.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button variant="destructive" className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

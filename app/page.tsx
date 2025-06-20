"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
  Settings,
  LogOut,
  TrendingUp,
  Wallet,
  CreditCard,
  Calendar,
  BarChart3,
} from "lucide-react"
import { LoginModal } from "../components/login-modal"
import { RegisterModal } from "../components/register-modal"
import { TransactionDetailsModal } from "../components/transaction-details-modal"
import { AnalyticsPage } from "../components/analytics-page"
import { SettingsPage } from "../components/settings-page"
import { LandingPage } from "../components/landing-page"
import { useAuth } from "@/hooks/useAuth"
import { collection, query, where, orderBy, onSnapshot, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { AddExpenseModal } from "@/components/add-expense-modal"
import { AddTopupModal } from "@/components/add-topup-modal"
import { Timestamp } from "firebase/firestore"

interface ExpenseTransaction {
  id: string
  type: 'expense'
  amount: number
  category: string
  description: string
  title: string
  date: string
}

interface TopupTransaction {
  id: string
  type: 'topup'
  amount: number
  source: string
  description: string
  title: string
  date: string
}

type Transaction = ExpenseTransaction | TopupTransaction;

interface Expense {
  title: string
  category: string
  amount: number
  notes: string
}

interface Topup {
  amount: number
  source: string
  notes: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showAddTopupModal, setShowAddTopupModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [wallet, setWallet] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])

  // Fetch wallet balance
  useEffect(() => {
    if (!user) return
    const userRef = doc(db, "users", user.uid)
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setWallet(snap.data().totalWallet || 0)
    })
    return () => unsub()
  }, [user])

  // Fetch expenses and topups
  useEffect(() => {
    if (!user) return
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", user.uid), orderBy("date", "desc"))
    const topupsQuery = query(collection(db, "topups"), where("userId", "==", user.uid), orderBy("date", "desc"))
    const unsubExpenses = onSnapshot(expensesQuery, (snap) => {
      setTransactions((prev) => {
        const expenses = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id, type: "expense" }))
        return [...expenses, ...prev.filter((t) => t.type !== "expense")].sort((a, b) => b.date?.seconds - a.date?.seconds)
      })
    })
    const unsubTopups = onSnapshot(topupsQuery, (snap) => {
      setTransactions((prev) => {
        const topups = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id, type: "topup" }))
        return [...topups, ...prev.filter((t) => t.type !== "topup")].sort((a, b) => b.date?.seconds - a.date?.seconds)
      })
    })
    return () => {
      unsubExpenses()
      unsubTopups()
    }
  }, [user])

  const handleAddExpense = () => {
    setShowAddExpenseModal(false)
    // In a real app, you would save this to a database
  }

  const handleAddTopup = () => {
    setShowAddTopupModal(false)
    // In a real app, you would save this to a database
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleLogout = async () => {
    await logout()
    setCurrentPage("dashboard")
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <LandingPage
        loginModal={<LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />}
        registerModal={
          <RegisterModal
            open={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
          />
        }
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />
    )
  }

  if (currentPage === "analytics") {
    return <AnalyticsPage onBack={() => setCurrentPage("dashboard")} transactions={transactions} />
  }

  if (currentPage === "settings") {
    return <SettingsPage onBack={() => setCurrentPage("dashboard")} wallet={wallet} setWallet={setWallet} />
  }

  const progress = (wallet / 5000) * 100

  // Calculate total expenses for the current month
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyExpenses = transactions
    .filter((tx) => {
      if (tx.type !== "expense" || !tx.date) return false;
      let txDate;
      if (typeof tx.date === "object" && tx.date.seconds) {
        txDate = new Date(tx.date.seconds * 1000);
      } else if (typeof tx.date === "string" || typeof tx.date === "number") {
        txDate = new Date(tx.date);
      } else {
        return false;
      }
      return (
        !isNaN(txDate) &&
        txDate.getMonth() === thisMonth &&
        txDate.getFullYear() === thisYear
      );
    })
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-semibold cursor-pointer" onClick={() => setCurrentPage("dashboard")}>
          MyPocket
        </h1>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage("analytics")} className="gap-1 sm:gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage("settings")} className="gap-1 sm:gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          <Avatar className="cursor-pointer h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={"/placeholder.svg"} alt={user.displayName || "User"} />
            <AvatarFallback>{(user.displayName?.charAt(0) || "U")}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCurrentPage("analytics")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{wallet.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Your current available balance</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCurrentPage("analytics")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{monthlyExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                vs. ₹{wallet.toLocaleString()} pocket money
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentPage("settings")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Pocket Money</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{wallet.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Auto-added on the 1st</p>
            </CardContent>
          </Card>

       
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="grid gap-2">
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>A log of your recent expenses and top-ups.</CardDescription>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 bg-background text-foreground"
                  onClick={() => setShowAddTopupModal(true)}
                >
                  <ArrowUpCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Top-up</span>
                </Button>
                <Button size="sm" className="h-8 gap-1" onClick={() => setShowAddExpenseModal(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Expense</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead className="hidden md:table-cell">Category/Source</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((tx) => (
                      <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell onClick={() => handleTransactionClick(tx)}>
                          <div className="flex items-center gap-2">
                            {tx.type === "expense" ? (
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <ArrowUpCircle className="h-4 w-4 text-green-500" />
                            )}
                            <div className="font-medium">{tx.title}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell" onClick={() => handleTransactionClick(tx)}>
                          <Badge variant="outline" className="bg-background text-foreground">
                            {tx.category || tx.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell" onClick={() => handleTransactionClick(tx)}>
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${tx.type === "expense" ? "text-red-500" : "text-green-500"}`}
                          onClick={() => handleTransactionClick(tx)}
                        >
                          {tx.type === "expense" ? "-" : "+"}₹{tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleTransactionClick(tx)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setCurrentPage("analytics")}
          >
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Your top spending categories this month.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card> */}
        </div>
      </main>

      <TransactionDetailsModal
        open={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={selectedTransaction}
      />
      <AddExpenseModal open={showAddExpenseModal} onClose={() => setShowAddExpenseModal(false)} />
      <AddTopupModal open={showAddTopupModal} onClose={() => setShowAddTopupModal(false)} />
    </div>
  )
}

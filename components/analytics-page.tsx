"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

interface AnalyticsPageProps {
  onBack: () => void
  transactions: any[]
}

export function AnalyticsPage({ onBack, transactions }: AnalyticsPageProps) {
  const expenses = transactions.filter((t) => t.type === "expense")
  const topups = transactions.filter((t) => t.type === "top-up")

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalTopups = topups.reduce((sum, top) => sum + top.amount, 0)

  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-semibold">Analytics</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Top-ups</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">₹{totalTopups.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{topups.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalTopups - totalExpenses >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                ₹{(totalTopups - totalExpenses).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total inflow - outflow</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>Your highest expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="font-bold">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending Chart</CardTitle>
              <CardDescription>Visual breakdown of your expenses</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

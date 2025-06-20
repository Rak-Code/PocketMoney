"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const [monthlyPocketMoney, setMonthlyPocketMoney] = useState(user?.monthlyPocketMoney?.toString() || "0");
  const [autoAddEnabled, setAutoAddEnabled] = useState(user?.autoAddEnabled ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    // TODO: Save to Firestore
    setTimeout(() => {
      setLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  }

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all your data? This action cannot be undone.")) {
      // Reset logic would go here
      alert("Data reset functionality would be implemented here")
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-1 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
              <CardDescription>Configure your monthly pocket money and budget preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 sm:space-y-6">
                <Label htmlFor="monthlyBudget">Monthly Pocket Money (₹)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={monthlyPocketMoney}
                  onChange={(e) => setMonthlyPocketMoney(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-add Monthly Budget</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add pocket money on the 1st of each month
                  </p>
                </div>
                <Switch checked={autoAddEnabled} onCheckedChange={setAutoAddEnabled} />
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Export Data as CSV
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Download PDF Report
                </Button>
              </div>

              <Button variant="destructive" onClick={handleResetData} className="w-full">
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

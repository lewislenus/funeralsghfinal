"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, CreditCard, Smartphone, DollarSign, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface DonationWidgetProps {
  funeralId: string
  deceasedName: string
  totalDonations: number
  currency: string
  supporters: number
  recentDonations: Array<{
    donor_name: string | null
    amount: number
    message: string | null
  }>
}

export function DonationWidget({
  funeralId,
  deceasedName,
  totalDonations,
  currency,
  supporters,
  recentDonations,
}: DonationWidgetProps) {
  const [amount, setAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("momo")
  const [isProcessing, setIsProcessing] = useState(false)

  const predefinedAmounts = [20, 50, 100, 200, 500, 1000]

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeral_id: funeralId,
          donor_name: donorName || null,
          donor_email: donorEmail || null,
          amount: Number.parseFloat(amount),
          currency,
          message: message || null,
          payment_method: paymentMethod,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process donation")
      }

      // In a real implementation, you would redirect to payment gateway here
      alert(
        `Thank you for your ${currency} ${amount} donation to support the ${deceasedName} family. You will be redirected to complete the payment.`,
      )

      // Reset form
      setAmount("")
      setDonorName("")
      setDonorEmail("")
      setMessage("")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to process donation. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Support Statistics */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Community Support</h3>
            <Heart className="w-6 h-6" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-1">
                {currency} {totalDonations.toLocaleString()}
              </div>
              <div className="text-green-100 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Total Raised
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{supporters}</div>
              <div className="text-green-100 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Supporters
              </div>
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <CardContent className="p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Recent Support</h4>
          <div className="space-y-3">
            {recentDonations.slice(0, 3).map((donation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{donation.donor_name || "Anonymous"}</p>
                  {donation.message && <p className="text-sm text-slate-600 truncate">{donation.message}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {currency} {donation.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="flex items-center text-xl text-slate-800">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mr-3">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Send Funeral Support
          </CardTitle>
          <p className="text-slate-600 mt-2">Help support the {deceasedName} family during this difficult time</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleDonation} className="space-y-6">
            {/* Amount Selection */}
            <div>
              <Label className="text-slate-700 font-medium">Donation Amount ({currency})</Label>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {predefinedAmounts.map((preset) => (
                  <motion.div key={preset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant={amount === preset.toString() ? "default" : "outline"}
                      onClick={() => setAmount(preset.toString())}
                      className={`h-12 w-full rounded-xl font-medium ${
                        amount === preset.toString()
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {preset}
                    </Button>
                  </motion.div>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-3 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                min="1"
              />
            </div>

            {/* Donor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donorName" className="text-slate-700 font-medium">
                  Your Name (Optional)
                </Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Anonymous"
                  className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <Label htmlFor="donorEmail" className="text-slate-700 font-medium">
                  Email (Optional)
                </Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-slate-700 font-medium">
                Message (Optional)
              </Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Words of comfort"
                className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            {/* Payment Method */}
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
                <TabsTrigger value="momo" className="flex items-center rounded-lg">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile Money
                </TabsTrigger>
                <TabsTrigger value="card" className="flex items-center rounded-lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="momo" className="space-y-4 mt-6">
                <div>
                  <Label className="text-slate-700 font-medium">Mobile Money Provider</Label>
                  <Select>
                    <SelectTrigger className="mt-2 rounded-xl border-slate-300">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                      <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                      <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium">Phone Number</Label>
                  <Input
                    placeholder="0XX XXX XXXX"
                    className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-6">
                <div>
                  <Label className="text-slate-700 font-medium">Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">CVV</Label>
                    <Input
                      placeholder="123"
                      className="mt-2 rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={!amount || isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-4 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Donate {currency} {amount || "0"}
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure payment powered by Flutterwave</span>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              Your donation will go directly to the family. All transactions are encrypted and secure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

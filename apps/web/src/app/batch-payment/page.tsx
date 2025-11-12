"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowRight, Check } from "lucide-react";
import UploadRecipients, { UploadRecipient } from "@/components/batch-payment/UploadRecipients";

// UI-only token config (no blockchain deps)
const TOKENS = {
  STRK: { symbol: "STRK", name: "Stark", icon: "💎" },
  USDC: { symbol: "USDC", name: "USD Coin", icon: "💵" },
  CELO: { symbol: "CELO", name: "Celo", icon: "🟡" },
} as const;
type TokenSymbol = keyof typeof TOKENS;

type Recipient = { id: string; address: string; amount: string };

export default function BatchPaymentPage() {
  const [step, setStep] = useState(1);
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>("STRK");
  const [recipients, setRecipients] = useState<Recipient[]>([{ id: "1", address: "", amount: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Inline notice to replace toasts
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const notify = ({ description, variant }: { description: string; variant?: "destructive" }) => {
    setNotice({ type: variant === "destructive" ? "error" : "success", message: description });
    setTimeout(() => setNotice(null), 2500);
  };

  // Shared input styles (reuse style from create-payment)
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const addRecipient = () => {
    const newId = (Math.max(...recipients.map((r) => parseInt(r.id)), 0) + 1).toString();
    setRecipients([...recipients, { id: newId, address: "", amount: "" }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) setRecipients(recipients.filter((r) => r.id !== id));
  };

  const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const totalAmount = () => recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const handleImported = (rows: UploadRecipient[]) => {
    const mapped: Recipient[] = rows.map((r, idx) => ({ id: String(idx + 1), address: r.address, amount: r.amount }));
    setRecipients(mapped);
    setShowUpload(false);
    notify({ description: `Imported ${mapped.length} recipients.` });
  };

  const validateForm = () => {
    // Basic checks: all addresses and amounts present, amounts > 0
    if (recipients.some((r) => !r.address.trim() || !r.amount.trim())) {
      notify({ description: "Please fill in every recipient address and amount.", variant: "destructive" });
      return false;
    }
    if (recipients.some((r) => (parseFloat(r.amount) || 0) <= 0)) {
      notify({ description: "All amounts must be greater than 0.", variant: "destructive" });
      return false;
    }
    // Optional: naive address format check (length)
    if (recipients.some((r) => r.address.length < 6)) {
      notify({ description: "One or more wallet addresses look invalid.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateForm()) return;
      setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API/processing delay
      await new Promise((resolve) => setTimeout(resolve, 900));
      notify({ description: "Batch submitted (simulation)." });
      setStep(3);
    } catch {
      notify({ description: "Failed to submit batch.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCSV = () => {
    const csv = ["Address,Amount\n", ...recipients.map((r) => `${r.address},${r.amount}\n`)].join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-recipients.csv";
    a.click();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          {notice && (
            <div
              className={`mb-6 rounded-md border p-3 text-sm ${
                notice.type === "error"
                  ? "border-destructive text-destructive-foreground bg-destructive/10"
                  : "border-border bg-muted/50 text-foreground"
              }`}
            >
              {notice.message}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {s > 1 && (
                      <div className={`h-1 flex-1 rounded transition-colors ${s <= step ? "bg-success" : "bg-muted"}`} />
                    )}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        s < step
                          ? "bg-success text-success-foreground"
                          : s === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${s === 1 ? "ml-0" : "mx-2"} ${s === 3 ? "mr-0" : ""}`}
                    >
                      {s < step ? <Check className="h-4 w-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`h-1 flex-1 rounded transition-colors ${s < step ? "bg-success" : "bg-muted"}`} />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground mt-2">
                    {s === 1 ? "Setup" : s === 2 ? "Review" : "Complete"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Enter recipients */
          }
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Payment</CardTitle>
                <CardDescription>Add recipient wallet addresses and amounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="token" className="text-sm font-medium">
                    Token
                  </label>
                  <select
                    id="token"
                    className={inputClass}
                    value={selectedToken}
                    onChange={(e) => setSelectedToken((e.target as HTMLSelectElement).value as TokenSymbol)}
                  >
                    {Object.entries(TOKENS).map(([symbol, token]) => (
                      <option key={symbol} value={symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recipients</span>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowUpload((v) => !v)} size="sm" variant="outline">
                        {showUpload ? "Manual entry" : "Import from file"}
                      </Button>
                      {!showUpload && (
                        <Button onClick={addRecipient} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Recipient
                        </Button>
                      )}
                    </div>
                  </div>

                  {showUpload ? (
                    <UploadRecipients onParsed={handleImported} />
                  ) : (
                    <>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recipients.map((r, idx) => (
                          <div key={r.id} className="flex gap-2 items-start p-3 rounded-lg border border-border">
                            <div className="flex-1 space-y-2">
                              <input
                                className={inputClass}
                                placeholder={`Wallet address ${idx + 1}`}
                                value={r.address}
                                onChange={(e) => updateRecipient(r.id, "address", (e.target as HTMLInputElement).value)}
                              />
                              <input
                                className={inputClass}
                                type="number"
                                placeholder={`Amount (${selectedToken})`}
                                value={r.amount}
                                onChange={(e) => updateRecipient(r.id, "amount", (e.target as HTMLInputElement).value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                            {recipients.length > 1 && (
                              <Button onClick={() => removeRecipient(r.id)} size="icon" variant="ghost" className="mt-1">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Recipients:</span>
                          <span className="font-medium">{recipients.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">{totalAmount().toFixed(2)} {selectedToken}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Next: Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Batch</CardTitle>
                <CardDescription>Confirm recipients and total before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-3 bg-muted/50 text-xs font-medium text-muted-foreground px-3 py-2">
                    <div>Address</div>
                    <div>Amount</div>
                    <div className="hidden sm:block">Token</div>
                  </div>
                  <div className="divide-y">
                    {recipients.map((r) => (
                      <div key={r.id} className="grid grid-cols-2 sm:grid-cols-3 px-3 py-2 text-sm">
                        <div className="font-mono break-all pr-3">{r.address}</div>
                        <div>
                          {r.amount} {selectedToken}
                        </div>
                        <div className="hidden sm:block">{selectedToken}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Recipients:</span>
                    <span className="font-medium">{recipients.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">{totalAmount().toFixed(2)} {selectedToken}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Confirm & Submit (Simulated)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Submitted</CardTitle>
                <CardDescription>Your batch has been submitted (simulation)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-accent/10 border border-success/20">
                  <div className="text-sm text-muted-foreground mb-2">Summary</div>
                  <div className="flex justify-between text-sm">
                    <span>Total Recipients</span>
                    <span className="font-medium">{recipients.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Amount</span>
                    <span className="font-medium">{totalAmount().toFixed(2)} {selectedToken}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={downloadCSV}>
                    Export CSV
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setStep(1);
                      setRecipients([{ id: "1", address: "", amount: "" }]);
                    }}
                  >
                    New Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


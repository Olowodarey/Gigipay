import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

type TokenInfo = { symbol: string; name: string; icon: string };

type Winner = { id: string; code: string; amount: string };

interface Props {
  formData: { name: string; totalPrize: string; expiryHours: string; selectedToken: string };
  tokens: Record<string, TokenInfo>;
  winners: Winner[];
  isCreating: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

function formatExpiry(expiryHours: string) {
  if (expiryHours === "0") return "Never ♾️";
  const hours = parseInt(expiryHours, 10) || 0;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  if (hours % (24 * 7) === 0) {
    const weeks = hours / (24 * 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} (${hours} hours)`;
  }
  if (hours % 24 === 0) {
    const days = hours / 24;
    return `${days} day${days !== 1 ? "s" : ""} (${hours} hours)`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h (${hours} hours)`;
}

export default function CreatePaymentStep2({
  formData,
  tokens,
  winners,
  isCreating,
  onBack,
  onConfirm,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Confirm</CardTitle>
        <CardDescription>Review your payment details before creating</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Giveaway Name</span>
            <span className="font-semibold text-foreground">{formData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Token</span>
            <span className="font-semibold text-foreground">
              {tokens[formData.selectedToken]?.icon} {formData.selectedToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Prize Pool</span>
            <span className="font-semibold text-foreground">
              {formData.totalPrize} {formData.selectedToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Number of Winners</span>
            <span className="font-semibold text-foreground">{winners.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Expires In</span>
            <span className="font-semibold text-foreground">
              {formatExpiry(formData.expiryHours)}
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Winners & Prizes</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto p-3 rounded-lg border border-border">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="flex justify-between items-center text-sm p-2 rounded bg-muted/30"
              >
                <span className="text-muted-foreground font-mono">{winner.code}</span>
                <span className="font-medium text-foreground">
                  {winner.amount} {formData.selectedToken}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onConfirm} className="flex-1" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              `Create Payment with ${formData.selectedToken}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, ArrowRight } from "lucide-react";

type TokenInfo = { symbol: string; name: string; icon: string };

type Winner = { id: string; code: string; amount: string };

type ExpiryUnit = "hours" | "days" | "weeks";

interface Props {
  formData: { name: string; totalPrize: string; expiryHours: string; selectedToken: string };
  onChange: (field: keyof Props["formData"], value: string) => void;
  tokens: Record<string, TokenInfo>;

  neverExpire: boolean;
  expiryValue: string;
  expiryUnit: ExpiryUnit;
  setNeverExpire: (v: boolean) => void;
  setExpiryValue: (v: string) => void;
  setExpiryUnit: (v: ExpiryUnit) => void;
  getExpiryDescription: (value: string, unit: ExpiryUnit) => string;
  convertToHours: (value: string, unit: ExpiryUnit) => number;

  winners: Winner[];
  addWinner: () => void;
  removeWinner: (id: string) => void;
  updateWinner: (id: string, field: keyof Winner, value: string) => void;
  calculateTotalPrizes: () => number;

  inputClass: string;
  onNext: () => void;
}

export default function CreatePaymentStep1({
  formData,
  onChange,
  tokens,
  neverExpire,
  expiryValue,
  expiryUnit,
  setNeverExpire,
  setExpiryValue,
  setExpiryUnit,
  getExpiryDescription,
  convertToHours,
  winners,
  addWinner,
  removeWinner,
  updateWinner,
  calculateTotalPrizes,
  inputClass,
  onNext,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Set up your giveaway with custom codes and amounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Payment Name</label>
          <input
            className={inputClass}
            id="name"
            type="text"
            placeholder="e.g., Summer2024"
            value={formData.name}
            onChange={(e) => onChange("name", (e.target as HTMLInputElement).value)}
            maxLength={31}
          />
          <p className="text-xs text-muted-foreground">
            A unique identifier for your giveaway (max 31 characters). Each giveaway must have a different name.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium">Token</label>
          <select
            id="token"
            className={inputClass}
            value={formData.selectedToken}
            onChange={(e) => onChange("selectedToken", (e.target as HTMLSelectElement).value)}
          >
            {Object.entries(tokens).map(([symbol, token]) => (
              <option key={symbol} value={symbol}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Choose which token to use for this giveaway</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="totalPrize" className="text-sm font-medium">Total Prize Pool ({formData.selectedToken})</label>
          <input
            className={inputClass}
            id="totalPrize"
            type="number"
            placeholder="100"
            value={formData.totalPrize}
            onChange={(e) => onChange("totalPrize", (e.target as HTMLInputElement).value)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="expiryHours" className="text-sm font-medium">Expiry Time</label>

          <div className="flex items-center space-x-2">
            <input
              id="neverExpire"
              type="checkbox"
              className="h-4 w-4"
              checked={neverExpire}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setNeverExpire(checked);
                if (checked) {
                  onChange("expiryHours", "0");
                } else {
                  const hours = convertToHours(expiryValue, expiryUnit);
                  onChange("expiryHours", hours.toString());
                }
              }}
            />
            <label htmlFor="neverExpire" className="text-sm font-medium cursor-pointer">
              Never Expire ♾️
            </label>
          </div>

          {!neverExpire && (
            <div className="flex gap-2">
              <input
                id="expiryValue"
                type="number"
                placeholder="24"
                value={expiryValue}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  setExpiryValue(v);
                  const hours = convertToHours(v, expiryUnit);
                  onChange("expiryHours", hours.toString());
                }}
                min="1"
                className={`${inputClass} flex-1`}
              />
              <select
                className={`${inputClass} w-[140px]`}
                value={expiryUnit}
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value as ExpiryUnit;
                  setExpiryUnit(value);
                  const hours = convertToHours(expiryValue, value);
                  onChange("expiryHours", hours.toString());
                }}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {neverExpire
              ? "This giveaway will never expire. You won't be able to reclaim funds."
              : `${getExpiryDescription(expiryValue, expiryUnit)}. After expiry, you can reclaim unclaimed funds.`}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Winners & Codes</span>
            <Button onClick={addWinner} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Payment
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {winners.map((winner, index) => (
              <div key={winner.id} className="flex gap-2 items-start p-3 rounded-lg border border-border">
                <div className="flex-1 space-y-2">
                  <input
                    className={inputClass}
                    placeholder={`Code (e.g., WINNER${index + 1})`}
                    value={winner.code}
                    onChange={(e) => updateWinner(winner.id, "code", (e.target as HTMLInputElement).value)}
                  />
                  <input
                    className={inputClass}
                    type="number"
                    placeholder={`Amount (${formData.selectedToken})`}
                    value={winner.amount}
                    onChange={(e) => updateWinner(winner.id, "amount", (e.target as HTMLInputElement).value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                {winners.length > 1 && (
                  <Button onClick={() => removeWinner(winner.id)} size="icon" variant="ghost" className="mt-1">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-muted/50 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Winners:</span>
              <span className="font-medium">{winners.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Prizes:</span>
              <span className="font-medium">{calculateTotalPrizes().toFixed(2)} {formData.selectedToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prize Pool:</span>
              <span className="font-medium">{formData.totalPrize || "0"} {formData.selectedToken}</span>
            </div>
            {formData.totalPrize && Math.abs(parseFloat(formData.totalPrize) - calculateTotalPrizes()) > 0.01 && (
              <div className="text-xs text-destructive mt-2">⚠️ Total prizes must equal prize pool</div>
            )}
          </div>
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          Next: Preview
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

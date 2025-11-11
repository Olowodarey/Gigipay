import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, Download } from "lucide-react";

type Winner = { id: string; code: string; amount: string };

interface Props {
  winners: Winner[];
  selectedToken: string;
  copyToClipboard: (text: string) => void;
  downloadCSV: () => void;
  getTweetTemplate: () => string;
}

export default function CreatePaymentStep3({
  winners,
  selectedToken,
  copyToClipboard,
  downloadCSV,
  getTweetTemplate,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="h-5 w-5 text-success" />
          Giveaway Created Successfully!
        </CardTitle>
        <CardDescription>Share these codes with your community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 max-h-64 overflow-y-auto p-3 rounded-lg border border-border">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm text-foreground">{winner.code}</span>
                <span className="text-xs text-muted-foreground">
                  {winner.amount} {selectedToken}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(winner.code)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={downloadCSV} variant="outline" className="w-full bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Share Template</h4>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {getTweetTemplate()}
            </p>
          </div>
          <Button onClick={() => copyToClipboard(getTweetTemplate())} variant="outline" className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            Copy Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

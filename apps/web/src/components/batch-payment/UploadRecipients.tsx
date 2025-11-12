"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";




export type UploadRecipient = { address: string; amount: string };

interface Props {
  onParsed: (rows: UploadRecipient[]) => void;
}

export default function UploadRecipients({ onParsed }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [errors, setErrors] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<UploadRecipient[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const fullRowsRef = useRef<UploadRecipient[] | null>(null);

  const onChooseFile = () => fileInputRef.current?.click();

  const handleFile = async (file: File) => {
    setErrors(null);
    setWarning(null);
    setPreviewRows([]);
    setTotalRows(0);
    fullRowsRef.current = null;

    const lower = file.name.toLowerCase();
    setFileName(file.name);

    try {
      if (lower.endsWith(".csv")) {
        const text = await file.text();
        const Papa = await import("papaparse");
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.errors?.length) {
          setErrors("Failed to parse CSV. Please check the file format.");
          return;
        }
        const rows = Array.isArray(parsed.data) ? parsed.data : [];
        useRows(rows);
      } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const XLSX = await import("xlsx");
        const wb = XLSX.read(data, { type: "array" });
        if (!wb.SheetNames.length) {
          setErrors("No sheets found in the Excel file.");
          return;
        }
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" } as any);

        useRows(rows);
      } else {
        setErrors("Unsupported file type. Please upload .csv, .xlsx or .xls");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Could not read file. Please try again.";
      setErrors(errorMessage);
    }
  };

  const normalizeKey = (k: string) => k.trim().toLowerCase();

  const useRows = (rows: any[]) => {
    if (!rows.length) {
      setErrors("No rows found.");
      return;
    }

    // Determine columns using header keys from first row
    const keys = Object.keys(rows[0] || {}).map(normalizeKey);
    const originalKeys = Object.keys(rows[0] || {});

    const findKey = (names: string[]) => {
      const idx = keys.findIndex((k) => names.some((n) => k.includes(n)));
      return idx >= 0 ? originalKeys[idx] : null;
    };

    const addressKey = findKey(["address", "wallet", "recipient"]);
    const amountKey = findKey(["amount", "value", "amt"]);

    if (!addressKey || !amountKey) {
      setErrors("Required columns not found. Make sure your header contains 'address' and 'amount' (case-insensitive).",
      );
      return;
    }

    const mapped: UploadRecipient[] = rows
      .map((r) => ({ 
        address: String(r[addressKey] || "").trim(), 
        amount: String(r[amountKey] || "").trim() 
      }))
      .filter((r) => {
        const hasAddress = r.address.length > 0;
        const hasValidAmount = r.amount.length > 0 && !isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0;
        return hasAddress && hasValidAmount;
      });

    if (mapped.length === 0) {
      setErrors("No valid rows found. Ensure each row has a valid address and positive amount.");
      return;
    }

    const skippedRows = rows.length - mapped.length;
    if (skippedRows > 0) {
      setWarning(`${skippedRows} row(s) skipped due to missing or invalid data.`);
    }

    fullRowsRef.current = mapped;
    setTotalRows(mapped.length);
    setPreviewRows(mapped.slice(0, 5));
  };

  const confirmUse = () => {
    if (!fullRowsRef.current || fullRowsRef.current.length === 0) {
      setErrors("Nothing to import. Please upload a valid file.");
      return;
    }
    onParsed(fullRowsRef.current);
  };

  const clear = () => {
    setFileName("");
    setErrors(null);
    setWarning(null);
    setPreviewRows([]);
    setTotalRows(0);
    fullRowsRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload recipients</CardTitle>
        <CardDescription>Upload a CSV/Excel file with columns: address, amount</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onChooseFile}>
            Choose file
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const csv = "address,amount\n0xabc...,10\n0xdef...,25";
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "recipients-template.csv";
              a.click();
            }}
          >
            Download CSV template
          </Button>
        </div>
        {fileName && <div className="text-sm text-muted-foreground">Selected: {fileName}</div>}
        {errors && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {errors}
          </div>
        )}
        {warning && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
            {warning}
          </div>
        )}
        {totalRows > 0 && (
          <div className="space-y-3">
            <div className="text-sm">Detected rows: {totalRows}</div>
            <div className="rounded-md border">
              <div className="grid grid-cols-2 bg-muted/50 text-xs font-medium text-muted-foreground px-3 py-2">
                <div>Address</div>
                <div>Amount</div>
              </div>
              <div className="divide-y">
                {previewRows.map((r, i) => (
                  <div key={i} className="grid grid-cols-2 px-3 py-2 text-sm">
                    <div className="font-mono break-all pr-3">{r.address}</div>
                    <div>{r.amount}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={confirmUse}>
                Use recipients
              </Button>
              <Button type="button" variant="ghost" onClick={clear}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

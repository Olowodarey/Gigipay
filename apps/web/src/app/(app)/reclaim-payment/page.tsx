"use client";


// Force dynamic rendering for this page
export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { RefreshCw, Sparkles, ExternalLink, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import {
 useRefundVoucher,
 useVouchersByName,
 useVoucherDetails,
 useSenderVouchers,
} from "@/hooks/useVouchers";
import { formatUnits, Address } from "viem";
import {
 getTokenAddresses,
 getNativeTokenSymbol,
} from "@/lib/contracts/gigipay";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";


type ReclaimState = "initial" | "valid" | "invalid" | "reclaimed";


function ReclaimPageContent() {
 const [voucherName, setVoucherName] = useState("");
 const [reclaimState, setReclaimState] = useState<ReclaimState>("initial");
 const [txHash, setTxHash] = useState("");
 const [totalAmount, setTotalAmount] = useState("");
 const [tokenSymbol, setTokenSymbol] = useState("CELO");
 const [voucherCount, setVoucherCount] = useState(0);


 // Wagmi hooks
 const { address, isConnected, chain } = useAccount();
 const {
   refundVouchersByName,
   isPending: isReclaiming,
   isConfirmed,
   hash,
   error,
 } = useRefundVoucher();
 const { voucherIds, isLoading: isLoadingVouchers } =
   useVouchersByName(voucherName);


 // Get sender's vouchers to verify ownership
 const { voucherIds: senderVoucherIds } = useSenderVouchers(address);


 // Inline notice to replace toasts
 const [notice, setNotice] = useState<{
   type: "success" | "error" | "info";
   message: string;
 } | null>(null);
 const toast = ({
   title,
   description,
   variant,
 }: {
   title?: string;
   description: string;
   variant?: "destructive";
 }) => {
   setNotice({
     type: variant === "destructive" ? "error" : "success",
     message: description || title || "",
   });
   // auto-hide after 3s
   setTimeout(() => setNotice(null), 3000);
 };


 // Shared input styles
 const inputClass =
   "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";


 // Get chain name for display
 const getChainName = () => {
   if (!chain?.id) return "supported network";
   if (chain.id === 42220) return "Celo Mainnet";
   if (chain.id === 8453) return "Base Mainnet";
   return chain.name || "supported network";
 };


 const validateVoucher = () => {
   if (!isConnected) {
     toast({
       title: "Wallet Not Connected",
       description: "Please connect your wallet to continue",
       variant: "destructive",
     });
     return;
   }


   if (!voucherName.trim()) {
     toast({
       title: "Missing Voucher Name",
       description: "Please enter the voucher name",
       variant: "destructive",
     });
     return;
   }


   // Check if voucher exists
   if (voucherIds.length === 0) {
     toast({
       title: "Invalid Voucher",
       description: "No vouchers found with this name",
       variant: "destructive",
     });
     setReclaimState("invalid");
     return;
   }


   // Check if user is the creator
   const isCreator = voucherIds.some((id) =>
     senderVoucherIds.some((senderId) => senderId === id),
   );


   if (!isCreator) {
     toast({
       title: "Not Authorized",
       description: "You are not the creator of this voucher",
       variant: "destructive",
     });
     setReclaimState("invalid");
     return;
   }


   setVoucherCount(voucherIds.length);
   setReclaimState("valid");
 };


 const handleReclaim = async () => {
   if (!isConnected) {
     toast({
       title: "Wallet Not Connected",
       description: "Please connect your wallet to reclaim",
       variant: "destructive",
     });
     return;
   }


   try {
     await refundVouchersByName(voucherName);
   } catch (err: any) {
     toast({
       title: "Reclaim Failed",
       description: err.message || "Failed to reclaim voucher",
       variant: "destructive",
     });
   }
 };


 // Handle successful reclaim
 useEffect(() => {
   if (isConfirmed && hash) {
     setTxHash(hash);
     setReclaimState("reclaimed");
     toast({ description: "Your payment has been successfully reclaimed!" });
   }
 }, [isConfirmed, hash]);


 // Handle errors
 useEffect(() => {
   if (error) {
     toast({
       title: "Error",
       description: error.message || "Transaction failed",
       variant: "destructive",
     });
     setReclaimState("invalid");
   }
 }, [error]);


 // Calculate total amount from vouchers
 useEffect(() => {
   if (voucherIds.length > 0 && chain?.id) {
     // For simplicity, we'll show the count
     // In a real app, you'd fetch each voucher's details and sum them
     setVoucherCount(voucherIds.length);
   }
 }, [voucherIds, chain]);


 return (
   <div className="flex flex-col min-h-screen">
     <div className="flex-1 py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
       <div className="container mx-auto max-w-lg">
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
         {/* Initial State */}
         {reclaimState === "initial" && (
           <Card>
             <CardHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                 <RefreshCw className="h-8 w-8 text-accent" />
               </div>
               <CardTitle className="text-2xl">Reclaim Your Payment</CardTitle>
               <CardDescription>
                 Enter your voucher name to reclaim expired or unclaimed
                 payments
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="space-y-2">
                 <label htmlFor="voucherName" className="text-sm font-medium">
                   Voucher Name
                 </label>
                 <input
                   id="voucherName"
                   type="text"
                   placeholder="e.g., Summer Giveaway"
                   value={voucherName}
                   onChange={(e) =>
                     setVoucherName((e.target as HTMLInputElement).value)
                   }
                   className={`${inputClass} text-center`}
                 />
                 <p className="text-xs text-muted-foreground">
                   Enter the name of the voucher you created
                 </p>
               </div>
               <Button onClick={validateVoucher} className="w-full" size="lg">
                 Check Voucher
               </Button>
             </CardContent>
           </Card>
         )}


         {/* Invalid State */}
         {reclaimState === "invalid" && (
           <Card className="border-destructive">
             <CardHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                 <AlertCircle className="h-8 w-8 text-destructive" />
               </div>
               <CardTitle className="text-2xl">
                 Invalid Voucher or Not Authorized
               </CardTitle>
               <CardDescription>
                 This voucher doesn't exist or you are not the creator
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                 <p className="text-sm text-center text-foreground">
                   <strong>Voucher Name:</strong>{" "}
                   <span className="font-mono font-semibold">
                     {voucherName}
                   </span>
                 </p>
                 <p className="text-xs text-center text-muted-foreground mt-3">
                   Please verify:
                 </p>
                 <ul className="text-xs text-muted-foreground space-y-1">
                   <li>• The voucher name is correct</li>
                   <li>• You are the creator of this voucher</li>
                   <li>• The voucher exists on-chain</li>
                   <li>• You are connected with the correct wallet</li>
                 </ul>
               </div>
               <Button
                 onClick={() => {
                   setReclaimState("initial");
                   setVoucherName("");
                 }}
                 variant="outline"
                 className="w-full"
               >
                 Try Another Voucher
               </Button>
             </CardContent>
           </Card>
         )}


         {/* Valid State */}
         {reclaimState === "valid" && (
           <Card className="border-accent">
             <CardHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-pulse">
                 <Sparkles className="h-8 w-8 text-accent" />
               </div>
               <CardTitle className="text-2xl">Voucher Found!</CardTitle>
               <CardDescription>Ready to reclaim your payment</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="p-6 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 text-center">
                 <div className="text-sm text-muted-foreground mb-2">
                   Voucher Name
                 </div>
                 <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                   {voucherName}
                 </div>
                 <div className="text-sm text-muted-foreground mb-1">
                   Total Vouchers
                 </div>
                 <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                   {voucherCount}
                 </div>
               </div>


               <div className="p-4 rounded-lg bg-muted/50 border border-border">
                 <p className="text-sm text-muted-foreground text-center">
                   This will reclaim all expired or unclaimed vouchers
                   associated with this name
                 </p>
               </div>


               <div className="space-y-3">
                 {!isConnected ? (
                   <p className="text-sm text-center text-muted-foreground">
                     Please connect your wallet to reclaim vocher
                   </p>
                 ) : (
                   <Button
                     onClick={handleReclaim}
                     className="w-full"
                     size="lg"
                     disabled={isReclaiming}
                   >
                     {isReclaiming ? "Reclaiming..." : "Reclaim Payment"}
                   </Button>
                 )}
                 <p className="text-xs text-center text-muted-foreground">
                   Gas fees apply on {getChainName()}
                 </p>
               </div>
             </CardContent>
           </Card>
         )}


         {/* Reclaimed State */}
         {reclaimState === "reclaimed" && (
           <Card className="border-success">
             <CardHeader className="text-center">
               <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                 <RefreshCw className="h-8 w-8 text-success" />
               </div>
               <CardTitle className="text-2xl">
                 Successfully Reclaimed!
               </CardTitle>
               <CardDescription>
                 Your payment has been reclaimed successfully
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="p-8 rounded-lg bg-gradient-to-br from-success/10 to-accent/10 border border-success/20 text-center">
                 <div className="flex flex-col items-center justify-center space-y-4">
                   <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                     <RefreshCw className="h-8 w-8 text-success" />
                   </div>
                   <div>
                     <div className="text-2xl font-bold text-success mb-1">
                       Payment Reclaimed!
                     </div>
                     <div className="text-lg font-semibold text-accent my-2">
                       {voucherName}
                     </div>
                     <div className="text-sm text-muted-foreground">
                       {voucherCount} voucher{voucherCount !== 1 ? "s" : ""}{" "}
                       reclaimed
                     </div>
                   </div>
                 </div>
               </div>


               <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                 <div className="flex justify-between items-start gap-4">
                   <span className="text-sm text-muted-foreground">
                     Transaction
                   </span>
                   <a
                     href={`https://celoscan.io/tx/${txHash}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm font-mono text-accent hover:underline flex items-center gap-1 break-all text-right"
                   >
                     {txHash.substring(0, 10)}...
                     {txHash.substring(txHash.length - 8)}
                     <ExternalLink className="h-3 w-3 flex-shrink-0" />
                   </a>
                 </div>
               </div>


               <Button
                 onClick={() => {
                   setReclaimState("initial");
                   setVoucherName("");
                   setTxHash("");
                 }}
                 variant="outline"
                 className="w-full"
               >
                 Reclaim Another Payment
               </Button>
             </CardContent>
           </Card>
         )}


         {/* Info Section */}
         <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
           <h3 className="font-semibold text-foreground mb-2 text-sm">
             How to reclaim payments
           </h3>
           <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
             <li>• Connect the wallet you used to create the voucher</li>
             <li>• Enter the voucher name you created</li>
             <li>
               • Reclaim all expired or unclaimed vouchers with that name
             </li>
             <li>• Only the creator can reclaim their vouchers</li>
           </ul>
         </div>
       </div>
     </div>
   </div>
 );
}


export default function ReclaimPage() {
 return (
   <ClientOnly>
     <ReclaimPageContent />
   </ClientOnly>
 );
}




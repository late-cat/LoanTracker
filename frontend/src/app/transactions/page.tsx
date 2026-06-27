"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";

export default function Transactions() {
  const txs = [
    { hash: "7f8b9...3a1", status: "confirmed", type: "Repay Loan", date: "Today, 10:30 AM" },
    { hash: "2c4d1...9e4", status: "processing", type: "Fund Loan", date: "Today, 10:28 AM" },
    { hash: "1a2b3...4c5", status: "failed", type: "Request Loan", date: "Yesterday" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Transaction Center</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {txs.map((tx, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 gap-4">
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="mt-1 sm:mt-0 shrink-0">
                    {tx.status === "confirmed" && <CheckCircle2 className="text-green-500" />}
                    {tx.status === "processing" && <Clock className="text-blue-500 animate-pulse" />}
                    {tx.status === "failed" && <XCircle className="text-red-500" />}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{tx.type}</p>
                    <p className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="shrink-0">{tx.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline truncate block">
                        {tx.hash}
                      </a>
                    </p>
                  </div>
                </div>
                
                {tx.status === "failed" && (
                  <button className="shrink-0 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded shadow-sm border w-full sm:w-auto">
                    <RefreshCw size={12} /> Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

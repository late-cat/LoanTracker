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
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  {tx.status === "confirmed" && <CheckCircle2 className="text-green-500" />}
                  {tx.status === "processing" && <Clock className="text-blue-500 animate-pulse" />}
                  {tx.status === "failed" && <XCircle className="text-red-500" />}
                  
                  <div>
                    <p className="font-medium text-sm">{tx.type}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">
                        {tx.hash}
                      </a>
                    </p>
                  </div>
                </div>
                
                {tx.status === "failed" && (
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white px-2 py-1 rounded shadow-sm border">
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

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRightLeft, HandCoins, PiggyBank, Search } from "lucide-react";
import { fetchContractEvents } from "@/lib/soroban";

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      setLoading(true);
      const fetchedEvents = await fetchContractEvents();
      if (mounted) {
        setTxs(fetchedEvents.reverse()); // Newest first
        setLoading(false);
      }
    };
    
    loadEvents();
    const interval = setInterval(loadEvents, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredTxs = txs.filter(tx => filter === "all" || tx.type === filter);

  const getIconForType = (type: string) => {
    switch (type) {
      case "loan_requested": return <Search className="text-blue-500" size={20} />;
      case "loan_funded": return <HandCoins className="text-green-500" size={20} />;
      case "loan_repaid": return <PiggyBank className="text-orange-500" size={20} />;
      case "score_updated": return <ArrowRightLeft className="text-purple-500" size={20} />;
      default: return <CheckCircle2 className="text-green-500" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction History</h1>
          <p className="text-gray-500 mt-1">Live on-chain events from the Soroban smart contracts</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 overflow-x-auto w-full sm:w-auto hide-scrollbar">
          {["all", "loan_requested", "loan_funded", "loan_repaid", "score_updated"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${
                filter === f 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
           <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
           <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded border shadow-sm">{txs.length} Total Events</span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading && txs.length === 0 ? (
               <div className="text-center py-12 text-gray-500 animate-pulse">Scanning ledger for transactions...</div>
            ) : filteredTxs.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                 <Search className="mx-auto mb-3 text-gray-300" size={32} />
                 No {filter !== 'all' ? filter.replace(/_/g, ' ') : ''} transactions found on the ledger.
               </div>
            ) : (
               filteredTxs.map((tx, i) => (
              <div key={tx.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors gap-4">
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="mt-1 sm:mt-0 shrink-0 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                    {getIconForType(tx.type)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 capitalize text-sm sm:text-base">{tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="shrink-0">{tx.time}</span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span className="text-gray-400 font-mono truncate block">
                        Ledger: {tx.ledger}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0 text-xs font-medium text-green-700 bg-green-50 border border-green-100/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   Confirmed
                </div>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

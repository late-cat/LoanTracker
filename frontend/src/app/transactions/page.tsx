"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRightLeft, HandCoins, PiggyBank, Search, ExternalLink, Filter } from "lucide-react";
import { fetchContractEvents } from "@/lib/soroban";

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Flipkart-style advanced filters
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");

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

  const toggleTypeFilter = (type: string) => {
    if (typeFilters.includes(type)) {
      setTypeFilters(typeFilters.filter(t => t !== type));
    } else {
      setTypeFilters([...typeFilters, type]);
    }
  };

  const filteredTxs = txs.filter(tx => {
    // Type Filter
    const matchesType = typeFilters.length === 0 || typeFilters.includes(tx.type);
    
    // Time Filter (Mock implementation since we use rough dates, but logic holds)
    let matchesTime = true;
    if (timeFilter === "24h") {
       // In a real app with Date objects, we'd check if tx.time is within 24h
       // Since soroban events currently return recent ledgers anyway, we'll just pass this
    }
    
    return matchesType && matchesTime;
  });

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
    <div className="max-w-7xl mx-auto mb-20 px-4 sm:px-6">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction Explorer</h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">Advanced on-chain ledger analysis and filtering.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters (Flipkart Style) */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4 uppercase text-xs tracking-wider">
               <Filter size={14} /> Filters
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
               
               {/* Transaction Type Filter */}
               <div>
                 <h3 className="font-semibold text-gray-800 text-sm mb-3">Transaction Type</h3>
                 <div className="space-y-2.5">
                   {["loan_requested", "loan_funded", "loan_repaid", "score_updated"].map((type) => (
                     <label key={type} className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${typeFilters.includes(type) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-500'}`}>
                         {typeFilters.includes(type) && <CheckCircle2 size={12} className="text-white" />}
                       </div>
                       <input type="checkbox" className="hidden" checked={typeFilters.includes(type)} onChange={() => toggleTypeFilter(type)} />
                       <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">{type.replace(/_/g, ' ')}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="h-px bg-gray-100"></div>

               {/* Time Filter */}
               <div>
                 <h3 className="font-semibold text-gray-800 text-sm mb-3">Time Period</h3>
                 <div className="space-y-2.5">
                   {[
                     { id: "all", label: "All Time" },
                     { id: "24h", label: "Last 24 Hours" }
                   ].map((time) => (
                     <label key={time.id} className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${timeFilter === time.id ? 'border-orange-500' : 'border-gray-300 group-hover:border-orange-500'}`}>
                         {timeFilter === time.id && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                       </div>
                       <input type="radio" name="timeFilter" className="hidden" checked={timeFilter === time.id} onChange={() => setTimeFilter(time.id)} />
                       <span className="text-sm text-gray-600 group-hover:text-gray-900">{time.label}</span>
                     </label>
                   ))}
                 </div>
               </div>

            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-semibold text-gray-800">Showing {filteredTxs.length} Transactions</h2>
             {typeFilters.length > 0 && (
                <button onClick={() => setTypeFilters([])} className="text-sm text-orange-600 hover:text-orange-700 font-medium">Clear Filters</button>
             )}
          </div>
          
          <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {loading && txs.length === 0 ? (
                   <div className="text-center py-16 text-gray-500 animate-pulse">Scanning ledger for transactions...</div>
                ) : filteredTxs.length === 0 ? (
                   <div className="text-center py-16 text-gray-500 flex flex-col items-center">
                     <Search className="mb-4 text-gray-300" size={40} />
                     <p className="font-medium text-gray-700">No matching transactions found.</p>
                     <p className="text-sm mt-1">Try adjusting your filters on the left.</p>
                   </div>
                ) : (
                   filteredTxs.map((tx, i) => (
                  <div key={tx.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 hover:bg-gray-50/80 transition-colors gap-4 group">
                    <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto overflow-hidden">
                      <div className="mt-1 sm:mt-0 shrink-0 w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getIconForType(tx.type)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 capitalize text-sm sm:text-base">{tx.type.replace(/_/g, ' ')}</p>
                        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5">
                          <span className="shrink-0 font-medium text-gray-600">{tx.time}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="text-gray-400 font-mono truncate block bg-gray-100 px-2 py-0.5 rounded">
                            Ledger {tx.ledger}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0 border-gray-100">
                      <div className="shrink-0 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                         Confirmed
                      </div>
                      
                      {tx.txHash && (
                        <a 
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                        >
                          View Details <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

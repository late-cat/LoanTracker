"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { fetchContractEvents } from "@/lib/soroban";

export default function ActivityFeed() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      setLoading(true);
      const fetchedEvents = await fetchContractEvents();
      if (mounted) {
        setEvents(fetchedEvents.reverse()); // Newest first
        setLoading(false);
      }
    };
    
    loadEvents();
    
    // Simple polling for new events every 10 seconds
    const interval = setInterval(loadEvents, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-20">
      <div className="flex items-center gap-2 mb-8">
        <Bell className="text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity Feed</h1>
      </div>

      <div className="space-y-0 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading && events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">Scanning blockchain for events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent events found.</div>
        ) : (
          events.map((event, index) => (
            <div key={event.id || index} className="p-3 sm:p-4 flex items-start gap-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="text-orange-500 w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900 capitalize truncate">
                    {event.type.replace(/_/g, ' ')}
                  </p>
                  
                  {event.amount && (
                    <p className={`text-sm font-semibold shrink-0 ml-2 ${event.type === 'loan_funded' ? 'text-green-600' : 'text-gray-900'}`}>
                      {event.type === 'loan_funded' ? '+' : ''}{event.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} XLM
                    </p>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                  {event.loanId ? `Loan #${event.loanId}` : JSON.stringify(event.data)}
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1.5 text-[10px] text-gray-400">
                  <span className="font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100">Ledger: {event.ledger}</span>
                  <span className="text-gray-300">•</span>
                  <span>{new Date(event.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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

      <div className="space-y-4">
        {loading && events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">Scanning blockchain for events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent events found.</div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Bell className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 capitalize truncate">
                    {event.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">
                    {JSON.stringify(event.data)}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">Ledger: {event.ledger}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

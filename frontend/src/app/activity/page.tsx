"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ActivityFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would poll getEvents or use Horizon SSE
    // Mocking real-time events for UI demonstration
    const mockEvents = [
      { id: 1, type: "loan_requested", amount: "1000 XLM", user: "GABC...1234", time: "Just now" },
      { id: 2, type: "score_updated", newScore: 520, user: "GXYZ...9876", time: "5 mins ago" },
      { id: 3, type: "loan_funded", amount: "500 XLM", user: "GDEF...4567", time: "1 hour ago" },
    ];
    setEvents(mockEvents);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Bell className="text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity Feed</h1>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {event.type === "loan_requested" && `Loan requested for ${event.amount}`}
                  {event.type === "score_updated" && `Credit score updated to ${event.newScore}`}
                  {event.type === "loan_funded" && `Loan funded for ${event.amount}`}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{event.user}</span>
                  <span>•</span>
                  <span>{event.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

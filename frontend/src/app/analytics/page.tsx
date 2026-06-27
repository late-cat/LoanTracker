"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";

export default function Analytics() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Protocol Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked (TVL)</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145,000 XLM</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans Processed</CardTitle>
            <PieChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">428</div>
            <p className="text-xs text-muted-foreground">92% Repayment Rate</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center p-12 bg-white/50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">More detailed charts coming soon via Hubble integration.</p>
      </div>
    </div>
  );
}

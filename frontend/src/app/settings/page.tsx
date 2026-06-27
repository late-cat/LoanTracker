"use client";

import { useWalletStore } from "@/store/wallet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, User } from "lucide-react";

export default function Settings() {
  const { address, network } = useWalletStore();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="text-orange-500" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User size={18} /> Profile & Wallet</CardTitle>
            <CardDescription>Manage your connected wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connected Address</span>
              <span className="text-sm text-gray-500">{address || "Not connected"}</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-medium">Network</span>
              <span className="text-sm text-gray-500 uppercase">{network}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield size={18} /> Security & Privacy</CardTitle>
            <CardDescription>Data is stored entirely on the Stellar blockchain.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The Loan Tracker protocol does not collect personally identifiable information. Your credit score is pseudo-anonymous and tied to your Soroban smart contract account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

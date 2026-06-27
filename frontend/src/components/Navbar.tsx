"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-[#fdfdfd]/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-serif">L</div>
          <span className="hidden sm:inline">LoanTracker</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link>
          <Link href="/activity" className="hover:text-orange-500 transition-colors">Activity</Link>
          <Link href="/transactions" className="hover:text-orange-500 transition-colors">Transactions</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <WalletConnect />
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-orange-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 px-6 flex flex-col gap-4 text-sm font-medium text-gray-600">
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-orange-500 transition-colors py-2 border-b border-gray-100">Dashboard</Link>
          <Link href="/activity" onClick={() => setIsOpen(false)} className="hover:text-orange-500 transition-colors py-2 border-b border-gray-100">Activity</Link>
          <Link href="/transactions" onClick={() => setIsOpen(false)} className="hover:text-orange-500 transition-colors py-2">Transactions</Link>
        </div>
      )}
    </nav>
  );
}

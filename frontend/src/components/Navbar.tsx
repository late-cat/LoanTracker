"use client";

import Link from "next/link";
import WalletConnect from "./WalletConnect";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="w-full bg-[#fdfdfd]/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-serif shrink-0">L</div>
            <span className="hidden sm:inline">LoanTracker</span>
          </Link>
          
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link>
              <Link href="/activity" className="hover:text-orange-500 transition-colors">Activity</Link>
              <Link href="/transactions" className="hover:text-orange-500 transition-colors">Transactions</Link>
            </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <WalletConnect />
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-orange-500 bg-gray-50 rounded-lg border border-gray-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 w-full z-40 bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="flex flex-col p-4 space-y-4 text-base font-medium text-gray-600">
              <Link href="/dashboard" className="hover:text-orange-500 transition-colors px-4 py-2 bg-gray-50 rounded-lg">Dashboard</Link>
              <Link href="/activity" className="hover:text-orange-500 transition-colors px-4 py-2 bg-gray-50 rounded-lg">Activity</Link>
              <Link href="/transactions" className="hover:text-orange-500 transition-colors px-4 py-2 bg-gray-50 rounded-lg">Transactions</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Link from "next/link";
import { MessageSquare, Code, Hash } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="sm:col-span-2 md:col-span-2">
            <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-serif">L</div>
              <span>LoanTracker</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Decentralized peer-to-peer lending powered by Stellar Soroban smart contracts. Build your on-chain credit reputation securely and transparently.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link></li>
              <li><Link href="/activity" className="hover:text-orange-500 transition-colors">Activity Feed</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                  <Code size={16} /> GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                  <Hash size={16} /> Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                  <MessageSquare size={16} /> Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Stellar Loan Tracker. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-400 justify-center">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

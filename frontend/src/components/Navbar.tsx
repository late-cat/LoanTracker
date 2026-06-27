import Link from "next/link";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#fdfdfd]/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-gray-800 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-serif">L</div>
          <span>LoanTracker</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-orange-500 transition-colors">Dashboard</Link>
          <Link href="/activity" className="hover:text-orange-500 transition-colors">Activity</Link>
          <Link href="/transactions" className="hover:text-orange-500 transition-colors">Transactions</Link>
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}

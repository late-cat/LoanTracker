"use client";

import { ArrowRight, Sparkles, Shield, LineChart, Coins, Lock, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: <Shield className="text-orange-500 w-6 h-6" />,
      title: "On-Chain Credit Scoring",
      description: "Your borrowing history builds a decentralized credit score directly on the Stellar ledger, proving your reliability to lenders without central authorities."
    },
    {
      icon: <Coins className="text-orange-500 w-6 h-6" />,
      title: "Peer-to-Peer Lending",
      description: "Lenders can fund secure loan requests using XLM or USDC. Smart contracts guarantee automated distribution and repayment tracking."
    },
    {
      icon: <Lock className="text-orange-500 w-6 h-6" />,
      title: "Soroban Security",
      description: "Built on Stellar's new Rust-based Soroban smart contracts, ensuring high throughput, low fees, and mathematically secure state transitions."
    },
    {
      icon: <Activity className="text-orange-500 w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "Monitor loan status, interest accumulation, and liquidation deadlines instantly through our live dashboard synchronized with the blockchain."
    }
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 font-sans mt-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-8 text-center max-w-4xl mx-auto flex flex-col items-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 text-orange-700 font-semibold text-xs tracking-wider mb-8 border border-orange-200 shadow-sm"
        >
          <Sparkles size={16} />
          <span>Powered by Stellar Soroban Contracts</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight"
        >
          Decentralized Lending, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
            Secured by Reputation.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 mb-10 max-w-2xl leading-relaxed text-lg"
        >
          The Loan Repayment Tracker leverages on-chain credit histories to facilitate trustless, peer-to-peer borrowing. 
          Build your credit score by repaying on time and unlock better lending rates automatically.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full"
        >
          <Link
            href="/dashboard"
            className="sticky-note-btn relative px-8 py-4 bg-[#fdf5c9] text-[#e88147] hover:bg-[#fbf1bb] font-bold text-lg transition-all flex items-center justify-center gap-2 hover:-rotate-2 group w-full sm:w-auto min-w-[200px]"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/60 border border-white/50 shadow-sm backdrop-blur-sm rotate-[-4deg]" />
            Launch App
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/transactions"
            className="px-8 py-4 text-gray-600 font-semibold text-lg hover:text-orange-600 transition-colors flex items-center gap-2 group"
          >
            <LineChart size={20} className="group-hover:scale-110 transition-transform" />
            View Protocols
          </Link>
        </motion.div>
      </section>

      {/* Interactive Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">A transparent dual-contract architecture ensuring safety for lenders and fairness for borrowers.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] transition-all group"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Interactive Element */}
      <section className="max-w-4xl mx-auto px-4 w-full text-center pb-12">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative sticky-note bg-[#fbf1bb] p-10 mx-auto transform rotate-1 hover:rotate-0 transition-all duration-500"
        >
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 border border-white/50 shadow-sm backdrop-blur-md rotate-[-3deg]" />
           <h3 className="text-2xl font-bold text-orange-800 mb-4 flex justify-center items-center gap-2">
             Ready to build your credit?
           </h3>
           <p className="text-orange-900/80 mb-6 font-medium">
             Connect your Freighter wallet to interact with the deployed Soroban contracts on the Stellar Testnet.
           </p>
           <Link href="/dashboard" className="inline-block bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 hover:shadow-lg transition-all active:scale-95">
             Connect Wallet
           </Link>
        </motion.div>
      </section>
    </div>
  );
}

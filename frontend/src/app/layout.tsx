import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stellar Loan Tracker",
  description: "Decentralized loan repayment tracker on Soroban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} kami-bg min-h-screen flex flex-col relative`}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
           <svg className="absolute top-[10%] left-[5%] w-32 h-32 text-yellow-100" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C60 0 70 10 70 20 C85 20 100 35 100 50 C100 65 85 80 70 80 C70 90 60 100 50 100 C40 100 30 90 30 80 C15 80 0 65 0 50 C0 35 15 20 30 20 C30 10 40 0 50 0 Z" />
           </svg>
           <svg className="absolute top-[30%] right-[10%] w-24 h-24 text-blue-100" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C60 0 70 10 70 20 C85 20 100 35 100 50 C100 65 85 80 70 80 C70 90 60 100 50 100 C40 100 30 90 30 80 C15 80 0 65 0 50 C0 35 15 20 30 20 C30 10 40 0 50 0 Z" />
           </svg>
           <svg className="absolute bottom-[20%] left-[20%] w-40 h-40 text-pink-100" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C60 0 70 10 70 20 C85 20 100 35 100 50 C100 65 85 80 70 80 C70 90 60 100 50 100 C40 100 30 90 30 80 C15 80 0 65 0 50 C0 35 15 20 30 20 C30 10 40 0 50 0 Z" />
           </svg>
           <svg className="absolute top-[60%] right-[25%] w-20 h-20 text-yellow-100" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 C60 0 70 10 70 20 C85 20 100 35 100 50 C100 65 85 80 70 80 C70 90 60 100 50 100 C40 100 30 90 30 80 C15 80 0 65 0 50 C0 35 15 20 30 20 C30 10 40 0 50 0 Z" />
           </svg>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

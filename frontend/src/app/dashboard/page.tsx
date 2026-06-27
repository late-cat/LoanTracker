"use client";

import { useWalletStore } from "@/store/wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BadgeDollarSign, CreditCard, TrendingUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCreditScore, fetchAllLoans, buildRequestLoanTx, buildRepayLoanTx, getRpcServer, TESTNET_NETWORK_PASSPHRASE, fetchWalletBalance, CONTRACT_ADDRESS_LOAN_PROTOCOL } from "@/lib/soroban";
import { rpc, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { address, kit } = useWalletStore();
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>("0.00");
  
  // Transaction states
  const [isRequesting, setIsRequesting] = useState(false);
  const [isRepaying, setIsRepaying] = useState<number | null>(null); // tracks loan id being repaid
  const [requestAmount, setRequestAmount] = useState<string>("100");
  const [requestDuration, setRequestDuration] = useState<number>(30);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const calculateInterest = () => {
    const amt = parseFloat(requestAmount) || 0;
    if (requestDuration === 7) return Math.floor(amt * 0.01);
    if (requestDuration === 30) return Math.floor(amt * 0.05);
    if (requestDuration === 90) return Math.floor(amt * 0.15);
    if (requestDuration === 365) return Math.floor(amt * 0.30);
    return 0;
  };
  const computedInterest = calculateInterest();
  
  // Optimistic UI states
  const [activeLoans, setActiveLoans] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loanFilter, setLoanFilter] = useState<'ALL' | 'ACTIVE' | 'REPAID' | 'PENDING'>('ALL');

  useEffect(() => {
    if (address) {
      setIsInitializing(true);
      fetchWalletBalance(address).then(bal => setWalletBalance(bal));
      fetchCreditScore(address).then(score => setCreditScore(score));
      fetchAllLoans(address).then(loans => {
          const userLoans = loans.filter(l => l.borrower === address);
          setMyLoans(userLoans);
          setActiveLoans(userLoans.filter(l => !l.isRepaid).length);
          setTotalBorrowed(userLoans.reduce((sum, l) => sum + l.amount, 0));
      }).finally(() => setIsInitializing(false));
    } else {
      setCreditScore(null);
      setActiveLoans(0);
      setTotalBorrowed(0);
      setMyLoans([]);
    }
  }, [address]);

  const handleRequestLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !kit) return;
    try {
      setIsRequesting(true);
      
      const amount = Number(requestAmount);
      if (isNaN(amount) || amount <= 0) {
          alert("Please enter a valid amount.");
          return;
      }

      // 1. Build the contract call XDR
      const xdr = await buildRequestLoanTx(address, amount, computedInterest, requestDuration);
      
      // 2. Request signature from Freighter
      const { signedTxXdr } = await kit.signTransaction(xdr, { 
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
        address
      });
      
      // 3. Submit to Soroban RPC
      const server = getRpcServer();
      const tx = TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(tx as any);
      
      if (response.status === "PENDING") {
         
         // Wait for the transaction to be fully confirmed on the blockchain
         let txStatus: string = response.status;
         if (txStatus === "PENDING") {
             let retries = 0;
             while ((txStatus === "PENDING" || txStatus === "NOT_FOUND") && retries < 15) {
                 await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s
                 const getTxRes = await server.getTransaction(response.hash);
                 txStatus = getTxRes.status;
                 retries++;
             }
         }

         if (txStatus !== "SUCCESS") {
             throw new Error("Transaction failed to confirm on the blockchain.");
         }

         // Fetch all loans again to get the exact newly created loan ID from the blockchain
         const freshLoans = await fetchAllLoans(address);
         const userFreshLoans = freshLoans.filter(l => l.borrower === address);
         const newLoan = userFreshLoans.sort((a, b) => b.id - a.id)[0]; // get the highest ID
         
         if (!newLoan) throw new Error("Could not find newly created loan.");

         // Inject the real transaction hash so the user can click it!
         newLoan.hash = response.hash;

         // Optimistic UI Update for Request
         setActiveLoans(prev => prev + 1);
         setTotalBorrowed(prev => prev + amount);
         setMyLoans(prev => [...prev, newLoan]);
         setIsDialogOpen(false);

         // 4. Trigger Automatic Backend Funding from the Platform Treasury
         try {
             const fundRes = await fetch('/api/fund', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ loanId: newLoan.id })
             });
             if (fundRes.ok) {
                 const fundData = await fundRes.json();
                 setMyLoans(prev => prev.map(loan => loan.id === newLoan.id ? { ...loan, isFunded: true } : loan));
                 alert(`Success! The Universal Platform Treasury has funded your loan.`);
                 if (fundData.hash) {
                     let fundTxStatus = "PENDING";
                     let fundRetries = 0;
                     while ((fundTxStatus === "PENDING" || fundTxStatus === "NOT_FOUND") && fundRetries < 15) {
                         await new Promise(resolve => setTimeout(resolve, 2000));
                         const getTxRes = await server.getTransaction(fundData.hash);
                         fundTxStatus = getTxRes.status;
                         fundRetries++;
                     }
                     if (fundTxStatus === "SUCCESS") {
                         fetchWalletBalance(address).then(setWalletBalance);
                     }
                 }
             } else {
                 throw new Error("Treasury funding failed");
             }
         } catch (fundErr) {
             console.error("Funding error", fundErr);
             alert("The loan was requested, but automatic funding failed. See console.");
         }

      } else {
         console.error("Submission failed", response);
         alert("Transaction failed to submit.");
      }
    } catch (e) {
      console.error(e);
      alert("Error requesting loan. Did you reject the signature?");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRepayLoan = async (loanId: number) => {
    if (!address || !kit) return;
    try {
      setIsRepaying(loanId);
      
      // 1. Build the contract call XDR
      const xdr = await buildRepayLoanTx(address, loanId);
      
      // 2. Request signature from Freighter
      const { signedTxXdr } = await kit.signTransaction(xdr, { 
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
        address
      });
      
      // 3. Submit to Soroban RPC
      const server = getRpcServer();
      const tx = TransactionBuilder.fromXDR(signedTxXdr, TESTNET_NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(tx as any);
      
      if (response.status === "PENDING") {
         let txStatus: string = response.status;
         if (txStatus === "PENDING") {
             let retries = 0;
             while ((txStatus === "PENDING" || txStatus === "NOT_FOUND") && retries < 15) {
                 await new Promise(resolve => setTimeout(resolve, 2000));
                 const getTxRes = await server.getTransaction(response.hash);
                 txStatus = getTxRes.status;
                 retries++;
             }
         }
         if (txStatus === "SUCCESS") {
             setMyLoans(prev => prev.map(loan => loan.id === loanId ? { ...loan, isRepaid: true, hash: response.hash } : loan));
             setActiveLoans(prev => Math.max(0, prev - 1));
             fetchWalletBalance(address).then(setWalletBalance);
         }
      } else {
         console.error("Submission failed", response);
         alert("Transaction failed to submit.");
      }
    } catch (e) {
      console.error(e);
      alert("Error repaying loan. Did you reject the signature?");
    } finally {
      setIsRepaying(null);
    }
  };

  const filteredAndSortedLoans = [...myLoans]
    .sort((a, b) => b.id - a.id)
    .filter(loan => {
      if (loanFilter === 'ALL') return true;
      if (loanFilter === 'ACTIVE') return !loan.isRepaid && loan.isFunded;
      if (loanFilter === 'REPAID') return loan.isRepaid;
      if (loanFilter === 'PENDING') return !loan.isRepaid && !loan.isFunded;
      return true;
    });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your loans and credit score.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {address ? (creditScore !== null ? creditScore : "Loading...") : "---"}
            </div>
            <p className="text-xs text-muted-foreground">On-chain live data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{address ? activeLoans : "0"}</div>
            <p className="text-xs text-muted-foreground">Currently borrowing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{address ? `${totalBorrowed.toLocaleString()} XLM` : "0 XLM"}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{address ? `${walletBalance} XLM` : "0 XLM"}</div>
            <p className="text-xs text-muted-foreground">Available on Testnet</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-bold">Your Loans</h2>
            {address && (
              <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg text-sm w-full sm:w-auto">
                <button onClick={() => setLoanFilter('ALL')} className={`px-3 py-1 rounded-md transition-colors flex-1 sm:flex-none text-center ${loanFilter === 'ALL' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>All</button>
                <button onClick={() => setLoanFilter('ACTIVE')} className={`px-3 py-1 rounded-md transition-colors flex-1 sm:flex-none text-center ${loanFilter === 'ACTIVE' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Active</button>
                <button onClick={() => setLoanFilter('PENDING')} className={`px-3 py-1 rounded-md transition-colors flex-1 sm:flex-none text-center ${loanFilter === 'PENDING' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Pending</button>
                <button onClick={() => setLoanFilter('REPAID')} className={`px-3 py-1 rounded-md transition-colors flex-1 sm:flex-none text-center ${loanFilter === 'REPAID' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Repaid</button>
              </div>
            )}
          </div>
          {address && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 w-full md:w-auto">
                  Request New Loan
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request a New Loan</DialogTitle>
                  <DialogDescription>
                    Enter the amount of XLM you wish to borrow. Your credit score determines your approval odds.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRequestLoan} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Amount (XLM)</label>
                    <Input 
                      type="number" 
                      min="1" 
                      step="1"
                      value={requestAmount} 
                      onChange={(e) => setRequestAmount(e.target.value)} 
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Duration</span>
                    <select
                      className="border border-gray-200 rounded-md text-gray-900 font-medium px-2 py-1 outline-none focus:border-orange-500 bg-white"
                      value={requestDuration}
                      onChange={(e) => setRequestDuration(Number(e.target.value))}
                    >
                      <option value={7}>7 Days (1%)</option>
                      <option value={30}>30 Days (5%)</option>
                      <option value={90}>90 Days (15%)</option>
                      <option value={365}>1 Year (30%)</option>
                    </select>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <span>Total Interest</span>
                    <span className="font-bold text-orange-600">+{computedInterest} XLM</span>
                  </div>
                  <button 
                    type="submit"
                    disabled={isRequesting}
                    className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium text-sm flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isRequesting ? "Signing & Submitting..." : "Submit Loan Request"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {address ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedLoans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No active loans found.</td>
                    </tr>
                  ) : (
                    filteredAndSortedLoans.map((loan, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${loan.isRepaid ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4 font-medium text-gray-900">#{loan.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{loan.amount.toLocaleString()} XLM</div>
                          <div className="text-xs text-gray-500">+{loan.interest} XLM interest</div>
                        </td>
                        <td className="px-6 py-4">
                           {loan.isRepaid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Repaid
                              </span>
                           ) : loan.isFunded ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Active & Funded
                              </span>
                           ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending Treasury
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           {loan.hash !== "on-chain" ? (
                               <a href={`https://stellar.expert/explorer/testnet/tx/${loan.hash}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 hover:underline inline-flex items-center gap-1 font-medium">
                                 {loan.hash.substring(0,8)}... ↗
                               </a>
                           ) : (
                               <a href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESS_LOAN_PROTOCOL}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 hover:underline inline-flex items-center gap-1">
                                 View Contract ↗
                               </a>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {!loan.isRepaid && loan.isFunded && (
                              <button 
                                onClick={() => handleRepayLoan(loan.id)}
                                disabled={isRepaying === loan.id}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
                              >
                                {isRepaying === loan.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                Repay Now
                              </button>
                           )}
                           {!loan.isRepaid && !loan.isFunded && (
                              <button 
                                onClick={async () => {
                                    const res = await fetch('/api/fund', { method: 'POST', body: JSON.stringify({ loanId: loan.id }), headers: { 'Content-Type': 'application/json'} });
                                    if (res.ok) setMyLoans(prev => prev.map(l => l.id === loan.id ? { ...l, isFunded: true } : l));
                                }}
                                className="inline-flex text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Trigger Treasury Retry
                              </button>
                           )}
                           {loan.isRepaid && (
                              <span className="text-gray-400 font-medium text-sm">Settled</span>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/60 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">Connect your wallet to view and request loans.</p>
          </div>
        )}
      </div>
    </div>
  );
}

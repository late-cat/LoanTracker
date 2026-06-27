import { rpc, Contract, xdr, Address, scValToNative, nativeToScVal, TransactionBuilder, Account } from '@stellar/stellar-sdk';
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';

export const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
export const TESTNET_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// These should be replaced with real addresses after deployment
export const CONTRACT_ADDRESS_CREDIT_RATING = process.env.NEXT_PUBLIC_CREDIT_RATING_ADDRESS || "";
export const CONTRACT_ADDRESS_LOAN_PROTOCOL = process.env.NEXT_PUBLIC_LOAN_PROTOCOL_ADDRESS || "CCYV4BQQ4C34WMMB53Z4Z3XWJ2QZ42W5QOQJ6QY7Y7Y7Y7Y7Y7Y7Y7Y7";

export const getRpcServer = () => {
    return new rpc.Server(TESTNET_RPC_URL);
};

export const fetchWalletBalance = async (address: string): Promise<string> => {
    try {
        const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
        if (!res.ok) return "0.00";
        const data = await res.json();
        const nativeBalance = data.balances?.find((b: any) => b.asset_type === 'native')?.balance;
        return nativeBalance ? parseFloat(nativeBalance).toFixed(2) : "0.00";
    } catch (e) {
        console.error("Failed to fetch balance", e);
        return "0.00";
    }
};

export const fetchCreditScore = async (userAddress: string): Promise<number> => {
    if (!CONTRACT_ADDRESS_CREDIT_RATING) return 500;
    try {
        const server = getRpcServer();
        const contract = new Contract(CONTRACT_ADDRESS_CREDIT_RATING);
        
        // Build the simulation request
        const tx = await server.prepareTransaction(
            // We use a dummy source account just for simulation
            new TransactionBuilder(
                new Account(userAddress, "0"),
                { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE }
            )
            .addOperation(contract.call("get_score", nativeToScVal(new Address(userAddress), { type: "address" })))
            .setTimeout(30)
            .build()
        );

        // Simulate
        const response = await server.simulateTransaction(tx);
        
        if (rpc.Api.isSimulationSuccess(response) && response.result?.retval) {
             return scValToNative(response.result.retval);
        }
    } catch (e) {
        console.error("Failed to fetch credit score", e);
    }
    return 500; // default score
};

export const buildRequestLoanTx = async (userAddress: string, amount: number, interest: number, durationDays: number) => {
    const server = getRpcServer();
    const contract = new Contract(CONTRACT_ADDRESS_LOAN_PROTOCOL);
    
    const account = await server.getAccount(userAddress);
    
    // Native XLM token contract on Testnet
    const XLM_TESTNET_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

    // Convert XLM to stroops (1 XLM = 10,000,000 stroops)
    const principalStroops = BigInt(amount) * BigInt(10000000);
    const interestStroops = BigInt(Math.floor(interest)) * BigInt(10000000);
    const durationSeconds = BigInt(durationDays * 24 * 60 * 60);

    // Create operation: request_loan(borrower: Address, token: Address, principal: i128, interest_amount: i128, duration: u64)
    const txBuilder = new TransactionBuilder(account, { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
    
    txBuilder.addOperation(contract.call(
        "request_loan",
        nativeToScVal(new Address(userAddress), { type: "address" }),
        nativeToScVal(new Address(XLM_TESTNET_ADDRESS), { type: "address" }),
        nativeToScVal(principalStroops, { type: "i128" }),
        nativeToScVal(interestStroops, { type: "i128" }), 
        nativeToScVal(durationSeconds, { type: "u64" }) 
    ));
    
    txBuilder.setTimeout(30);
    const tx = txBuilder.build();
    
    const preparedTx = await server.prepareTransaction(tx);
    return preparedTx.toXDR();
};

export const buildRepayLoanTx = async (userAddress: string, loanId: number): Promise<string> => {
    const server = getRpcServer();
    const contract = new Contract(CONTRACT_ADDRESS_LOAN_PROTOCOL);
    
    const account = await server.getAccount(userAddress);
    const txBuilder = new TransactionBuilder(account, { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
    
    txBuilder.addOperation(contract.call(
        "repay_loan",
        nativeToScVal(BigInt(loanId), { type: "u64" })
    ));
    
    txBuilder.setTimeout(30);
    const tx = txBuilder.build();
    
    const preparedTx = await server.prepareTransaction(tx);
    return preparedTx.toXDR();
};

export const buildFundLoanTx = async (userAddress: string, loanId: number): Promise<string> => {
    const server = getRpcServer();
    const contract = new Contract(CONTRACT_ADDRESS_LOAN_PROTOCOL);
    
    const account = await server.getAccount(userAddress);
    
    // Create operation: fund_loan(env, lender: Address, loan_id: u64)
    const txBuilder = new TransactionBuilder(account, { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE });
    
    txBuilder.addOperation(contract.call(
        "fund_loan",
        nativeToScVal(new Address(userAddress), { type: "address" }),
        nativeToScVal(BigInt(loanId), { type: "u64" })
    ));
    
    txBuilder.setTimeout(30);
    const tx = txBuilder.build();
    
    const preparedTx = await server.prepareTransaction(tx);
    return preparedTx.toXDR();
};
export const fetchAllLoans = async (userAddress: string) => {
    const server = getRpcServer();
    const contract = new Contract(CONTRACT_ADDRESS_LOAN_PROTOCOL);
    const loans = [];
    
    try {
        const txBuilderParams = { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE };
        const account = new Account(userAddress, "0");
        
        // Fetch sequentially to prevent RPC rate limiting
        for (let i = 1; i <= 100; i++) {
            let retries = 3;
            let success = false;
            while (retries > 0 && !success) {
                try {
                    const tx = await server.prepareTransaction(
                        new TransactionBuilder(account, txBuilderParams)
                        .addOperation(contract.call("get_loan", nativeToScVal(BigInt(i), { type: "u64" })))
                        .setTimeout(30)
                        .build()
                    );

                    const response = await server.simulateTransaction(tx);
                    if (rpc.Api.isSimulationSuccess(response) && response.result?.retval) {
                        const loanData = scValToNative(response.result.retval);
                        
                        const amount = Number(loanData.principal) / 10000000;
                        const interest = Number(loanData.interest_amount) / 10000000;
                        
                        let statusStr = "Requested";
                        if (typeof loanData.status === 'string') {
                            statusStr = loanData.status;
                        } else if (Array.isArray(loanData.status) && loanData.status.length > 0) {
                            statusStr = loanData.status[0];
                        } else if (loanData.status && typeof loanData.status === 'object') {
                            statusStr = Object.keys(loanData.status)[0] || "Requested";
                        }
                        
                        loans.push({
                            id: i,
                            amount,
                            interest,
                            hash: "on-chain", 
                            isFunded: statusStr === "Funded" || statusStr === "Repaid",
                            isRepaid: statusStr === "Repaid",
                            borrower: loanData.borrower
                        });
                        success = true;
                    } else {
                        // Simulation returned error -> Loan not found panic -> End of loans
                        return loans;
                    }
                } catch (e: any) {
                    const errorStr = e.message || String(e);
                    // If the contract panics because the loan doesn't exist, it throws a HostError/InvalidAction
                    if (errorStr.includes("InvalidAction") || errorStr.includes("UnreachableCodeReached") || errorStr.includes("HostError")) {
                        return loans;
                    }
                    
                    // Otherwise it's a Network or rate limit error
                    retries--;
                    if (retries === 0) {
                        console.warn(`fetchAllLoans stopped at index ${i}. Reason:`, errorStr);
                        return loans; // Give up and return what we have
                    }
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
        return loans;
    } catch (e) {
        console.error("Failed to fetch loans", e);
        return loans;
    }
};

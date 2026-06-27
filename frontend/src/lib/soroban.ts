import { rpc, Contract, xdr, Address, scValToNative, nativeToScVal, TransactionBuilder, Account } from '@stellar/stellar-sdk';
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';

export const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
export const TESTNET_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const CONTRACT_ADDRESS_CREDIT_RATING = process.env.NEXT_PUBLIC_CREDIT_RATING_ADDRESS || "CDJ25NHZOKCCMCJHCDD7O7FG7NQKFICHEJL3NUSP7O5ENZYPZYC4IDCO";
export const CONTRACT_ADDRESS_LOAN_PROTOCOL = process.env.NEXT_PUBLIC_LOAN_PROTOCOL_ADDRESS || "CBQAH35CKA64FZFLCVVO35FZYJVWBJD5FXWJNULTQDUNGKQM6RWK6CLA";

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
        
        const tx = await server.prepareTransaction(
            new TransactionBuilder(
                new Account(userAddress, "0"),
                { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE }
            )
            .addOperation(contract.call("get_score", nativeToScVal(new Address(userAddress), { type: "address" })))
            .setTimeout(30)
            .build()
        );

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
    
    const XLM_TESTNET_ADDRESS = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

    const principalStroops = BigInt(amount) * BigInt(10000000);
    const interestStroops = BigInt(Math.floor(interest)) * BigInt(10000000);
    const durationSeconds = BigInt(durationDays * 24 * 60 * 60);

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
    const loans: any[] = [];
    
    try {
        const txBuilderParams = { fee: "100", networkPassphrase: TESTNET_NETWORK_PASSPHRASE };
        const account = new Account(userAddress, "0");

        const countTx = await server.prepareTransaction(
            new TransactionBuilder(account, txBuilderParams)
            .addOperation(contract.call("get_loan_count"))
            .setTimeout(30)
            .build()
        );
        const countResponse = await server.simulateTransaction(countTx);
        if (!rpc.Api.isSimulationSuccess(countResponse) || !countResponse.result?.retval) {
            return [];
        }
        const totalLoans = Number(scValToNative(countResponse.result.retval));
        
        if (totalLoans === 0) return [];

        const chunkSize = 5;
        for (let i = 1; i <= totalLoans; i += chunkSize) {
            const chunk = [];
            for (let j = i; j < i + chunkSize && j <= totalLoans; j++) {
                chunk.push(j);
            }
            
            const chunkPromises = chunk.map(async (loanId) => {
                try {
                    const tx = await server.prepareTransaction(
                        new TransactionBuilder(account, txBuilderParams)
                        .addOperation(contract.call("get_loan", nativeToScVal(BigInt(loanId), { type: "u64" })))
                        .setTimeout(30)
                        .build()
                    );
                    const response = await server.simulateTransaction(tx);
                    if (rpc.Api.isSimulationSuccess(response) && response.result?.retval) {
                        const loanData = scValToNative(response.result.retval);
                        const amount = Number(loanData.principal) / 10000000;
                        const interest = Number(loanData.interest_amount) / 10000000;
                        let statusStr = "Requested";
                        if (typeof loanData.status === 'string') statusStr = loanData.status;
                        else if (Array.isArray(loanData.status) && loanData.status.length > 0) statusStr = loanData.status[0];
                        else if (loanData.status && typeof loanData.status === 'object') statusStr = Object.keys(loanData.status)[0] || "Requested";
                        
                        return {
                            id: loanId,
                            amount,
                            interest,
                            hash: "on-chain", 
                            isFunded: statusStr === "Funded" || statusStr === "Repaid",
                            isRepaid: statusStr === "Repaid",
                            borrower: loanData.borrower
                        };
                    }
                } catch (e) {
                    console.warn(`Failed to fetch loan ${loanId}`, e);
                }
                return null;
            });

            const results = await Promise.all(chunkPromises);
            for (const res of results) {
                if (res) loans.push(res);
            }
        }
        return loans;
    } catch (e) {
        console.error("Failed to fetch loans", e);
        return loans;
    }
};

export const fetchContractEvents = async () => {
    const server = getRpcServer();
    try {
        const latestLedger = await server.getLatestLedger();
        const startLedger = Math.max(1, latestLedger.sequence - 17280); // Roughly last 24 hours of ledgers

        const events = await server.getEvents({
            startLedger,
            filters: [
                {
                    type: "contract",
                    contractIds: [CONTRACT_ADDRESS_LOAN_PROTOCOL, CONTRACT_ADDRESS_CREDIT_RATING].filter(Boolean)
                }
            ],
            limit: 50
        });

        return events.events.map(e => ({
            id: e.id,
            type: e.topic[0] ? scValToNative(e.topic[0]) : "unknown",
            data: e.value ? scValToNative(e.value) : null,
            ledger: e.ledger,
            contractId: e.contractId,
            time: new Date().toLocaleString() // Rough estimation for now
        }));
    } catch (e) {
        console.warn("Failed to fetch events:", e);
        return [];
    }
};

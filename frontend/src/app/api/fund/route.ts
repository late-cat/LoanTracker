import { NextResponse } from 'next/server';
import { rpc, Contract, Address, nativeToScVal, TransactionBuilder, Keypair } from '@stellar/stellar-sdk';

const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
const TESTNET_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const CONTRACT_ADDRESS_LOAN_PROTOCOL = process.env.NEXT_PUBLIC_LOAN_PROTOCOL_ADDRESS || "";

export async function POST(req: Request) {
  try {
    const { loanId } = await req.json();

    if (loanId === undefined || loanId === null) {
      return NextResponse.json({ error: 'Missing loanId' }, { status: 400 });
    }

    const secretKey = process.env.TREASURY_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Treasury key not configured' }, { status: 500 });
    }

    const treasuryKeypair = Keypair.fromSecret(secretKey);
    const treasuryAddress = treasuryKeypair.publicKey();

    const server = new rpc.Server(TESTNET_RPC_URL);
    const contract = new Contract(CONTRACT_ADDRESS_LOAN_PROTOCOL);

    let retries = 5;
    while (retries > 0) {
      try {
        const account = await server.getAccount(treasuryAddress);

        const txBuilder = new TransactionBuilder(account, { fee: "1000", networkPassphrase: TESTNET_NETWORK_PASSPHRASE });

        txBuilder.addOperation(contract.call(
          "fund_loan",
          nativeToScVal(BigInt(loanId), { type: "u64" }),
          nativeToScVal(new Address(treasuryAddress), { type: "address" })
        ));

        txBuilder.setTimeout(30);
        const tx = txBuilder.build();

        const preparedTx = await server.prepareTransaction(tx);
        
        preparedTx.sign(treasuryKeypair);

        const response = await server.sendTransaction(preparedTx as any);

        if (response.status === "PENDING") {
          return NextResponse.json({ success: true, hash: response.hash });
        } else {
          throw new Error(`Transaction failed: ${JSON.stringify(response)}`);
        }
      } catch (error: any) {
        retries--;
        console.error(`Funding attempt failed, ${retries} retries left. Error:`, error.message);
        if (retries === 0) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s before retry
      }
    }
    
    return NextResponse.json({ error: "Max retries reached" }, { status: 500 });
  } catch (error: any) {
    console.error("API error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

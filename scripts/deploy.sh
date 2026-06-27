#!/bin/bash
set -e

echo "Building contracts..."
cd contracts
stellar contract build

echo "Deploying to Testnet..."

echo "Deploying Credit Rating Contract..."
echo "Uploading Credit Rating Contract WASM..."
CR_WASM=$(stellar contract upload --wasm target/wasm32v1-none/release/credit_rating.wasm --source PROJECT_TESTNET --network testnet)
sleep 5
echo "Deploying Credit Rating Contract..."
CR_ID=$(stellar contract deploy --wasm-hash $CR_WASM --source PROJECT_TESTNET --network testnet)
echo "Credit Rating Contract ID: $CR_ID"
sleep 5

echo "Uploading Loan Protocol Contract WASM..."
LP_WASM=$(stellar contract upload --wasm target/wasm32v1-none/release/loan_protocol.wasm --source PROJECT_TESTNET --network testnet)
sleep 5
echo "Deploying Loan Protocol Contract..."
LP_ID=$(stellar contract deploy --wasm-hash $LP_WASM --source PROJECT_TESTNET --network testnet)
echo "Loan Protocol Contract ID: $LP_ID"
sleep 5

echo "Initializing contracts..."
# In a real deployment, replace ADMIN with a real address
ADMIN=$(stellar keys address PROJECT_TESTNET)

echo "Initializing Credit Rating with Loan Protocol as Admin..."
stellar contract invoke --id $CR_ID --source PROJECT_TESTNET --network testnet -- initialize --admin $LP_ID
sleep 5

echo "Initializing Loan Protocol..."
stellar contract invoke --id $LP_ID --source PROJECT_TESTNET --network testnet -- initialize --admin $ADMIN --credit_rating $CR_ID

echo "Deployment successful."
echo "CR_ID: $CR_ID"
echo "LP_ID: $LP_ID"

echo "Please update NEXT_PUBLIC_CREDIT_RATING_ADDRESS and NEXT_PUBLIC_LOAN_PROTOCOL_ADDRESS in your frontend .env file."

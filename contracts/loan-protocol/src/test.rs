#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient;

#[test]
fn test_loan_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    // Register Credit Rating
    let cr_id = env.register_contract(None, credit_rating::CreditRatingContract);
    let cr_client = credit_rating::CreditRatingContractClient::new(&env, &cr_id);

    // Register Loan Protocol
    let lp_id = env.register_contract(None, LoanProtocolContract);
    let lp_client = LoanProtocolContractClient::new(&env, &lp_id);

    // Init Credit Rating with Loan Protocol as admin
    cr_client.initialize(&lp_client.address);

    let admin = Address::generate(&env);
    lp_client.initialize(&admin, &cr_id);

    // Setup Token
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token = TokenClient::new(&env, &token_id.address());
    let token_admin_client = StellarAssetClient::new(&env, &token_id.address());

    let borrower = Address::generate(&env);
    let lender = Address::generate(&env);

    // Mint tokens to lender (principal) and borrower (for interest)
    token_admin_client.mint(&lender, &1000);
    token_admin_client.mint(&borrower, &100);

    // Borrower requests loan
    let loan_id = lp_client.request_loan(&borrower, &token.address, &1000, &50, &100);
    assert_eq!(loan_id, 1);

    // Lender funds loan
    lp_client.fund_loan(&loan_id, &lender);

    let loan = lp_client.get_loan(&loan_id);
    assert_eq!(loan.status, LoanStatus::Funded);
    assert_eq!(token.balance(&borrower), 1100); // 100 + 1000
    assert_eq!(token.balance(&lender), 0);

    // Borrower repays loan
    lp_client.repay_loan(&loan_id);

    let loan = lp_client.get_loan(&loan_id);
    assert_eq!(loan.status, LoanStatus::Repaid);
    assert_eq!(token.balance(&borrower), 50); // 1100 - 1050
    assert_eq!(token.balance(&lender), 1050);

    // Verify credit score increased
    let score = cr_client.get_score(&borrower);
    assert_eq!(score, 520);
}

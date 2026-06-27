#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_credit_rating() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CreditRatingContract);
    let client = CreditRatingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin);

    // Initial score should be 500
    assert_eq!(client.get_score(&user), 500);

    // Update score
    env.mock_all_auths();
    client.update_score(&user, &50);

    // New score should be 550
    assert_eq!(client.get_score(&user), 550);
    
    // Penalize score
    client.update_score(&user, &-100);
    assert_eq!(client.get_score(&user), 450);
}

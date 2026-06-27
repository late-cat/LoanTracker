#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Admin,
    Score(Address),
}

#[contract]
pub struct CreditRatingContract;

#[contractimpl]
impl CreditRatingContract {
    /// Initialize with an admin address that is allowed to update scores.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Update the credit score for a user. Only admin can call this.
    pub fn update_score(env: Env, user: Address, score_delta: i32) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        admin.require_auth();

        let current_score: i32 = env.storage().persistent().get(&DataKey::Score(user.clone())).unwrap_or(500); // Base score is 500
        let new_score = current_score.saturating_add(score_delta);
        
        // Cap max score to 850 and min score to 300
        let final_score = if new_score > 850 { 850 } else if new_score < 300 { 300 } else { new_score };
        
        env.storage().persistent().set(&DataKey::Score(user.clone()), &final_score);
        env.events().publish((Symbol::new(&env, "score_updated"), user), final_score);
    }

    /// Get the credit score for a user.
    pub fn get_score(env: Env, user: Address) -> i32 {
        env.storage().persistent().get(&DataKey::Score(user)).unwrap_or(500)
    }
}

mod test;

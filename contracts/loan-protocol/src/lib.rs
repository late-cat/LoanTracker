#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol, IntoVal};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Requested,
    Funded,
    Repaid,
    Defaulted,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    pub id: u64,
    pub borrower: Address,
    pub lender: Option<Address>,
    pub principal: i128,
    pub interest_amount: i128,
    pub deadline: u64,
    pub status: LoanStatus,
    pub token: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    CreditRatingContract,
    LoanCounter,
    Loan(u64),
}

#[contract]
pub struct LoanProtocolContract;

#[contractimpl]
impl LoanProtocolContract {
    pub fn initialize(env: Env, admin: Address, credit_rating: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CreditRatingContract, &credit_rating);
        env.storage().instance().set(&DataKey::LoanCounter, &0u64);
    }

    pub fn request_loan(
        env: Env, 
        borrower: Address, 
        token: Address,
        principal: i128, 
        interest_amount: i128, 
        duration: u64
    ) -> u64 {
        borrower.require_auth();

        let cr_address: Address = env.storage().instance().get(&DataKey::CreditRatingContract).unwrap();
        let score: i32 = env.invoke_contract(
            &cr_address,
            &Symbol::new(&env, "get_score"),
            soroban_sdk::vec![&env, borrower.into_val(&env)]
        );

        if score < 500 {
            panic!("Credit score too low");
        }

        let mut counter: u64 = env.storage().instance().get(&DataKey::LoanCounter).unwrap();
        counter += 1;
        env.storage().instance().set(&DataKey::LoanCounter, &counter);

        let deadline = env.ledger().timestamp() + duration;

        let loan = Loan {
            id: counter,
            borrower: borrower.clone(),
            lender: None,
            principal,
            interest_amount,
            deadline,
            status: LoanStatus::Requested,
            token,
        };

        env.storage().persistent().set(&DataKey::Loan(counter), &loan);
        env.events().publish((Symbol::new(&env, "loan_requested"), counter), borrower);

        counter
    }

    pub fn fund_loan(env: Env, loan_id: u64, lender: Address) {
        lender.require_auth();

        let mut loan: Loan = env.storage().persistent().get(&DataKey::Loan(loan_id)).expect("Loan not found");
        if loan.status != LoanStatus::Requested {
            panic!("Loan not in Requested state");
        }

        let token_client = token::Client::new(&env, &loan.token);
        token_client.transfer(&lender, &loan.borrower, &loan.principal);

        loan.lender = Some(lender.clone());
        loan.status = LoanStatus::Funded;
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);

        env.events().publish((Symbol::new(&env, "loan_funded"), loan_id), lender);
    }

    pub fn repay_loan(env: Env, loan_id: u64) {
        let mut loan: Loan = env.storage().persistent().get(&DataKey::Loan(loan_id)).expect("Loan not found");
        if loan.status != LoanStatus::Funded {
            panic!("Loan not in Funded state");
        }

        let borrower = loan.borrower.clone();
        borrower.require_auth();

        let lender = loan.lender.clone().unwrap();

        let total_amount = loan.principal + loan.interest_amount;
        let token_client = token::Client::new(&env, &loan.token);
        token_client.transfer(&borrower, &lender, &total_amount);

        loan.status = LoanStatus::Repaid;
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);

        let cr_address: Address = env.storage().instance().get(&DataKey::CreditRatingContract).unwrap();
        let _: () = env.invoke_contract(
            &cr_address,
            &Symbol::new(&env, "update_score"),
            soroban_sdk::vec![&env, borrower.into_val(&env), 20i32.into_val(&env)]
        );

        env.events().publish((Symbol::new(&env, "loan_repaid"), loan_id), borrower);
    }

    pub fn liquidate_loan(env: Env, loan_id: u64) {
        let mut loan: Loan = env.storage().persistent().get(&DataKey::Loan(loan_id)).expect("Loan not found");
        if loan.status != LoanStatus::Funded {
            panic!("Loan not in Funded state");
        }

        if env.ledger().timestamp() <= loan.deadline {
            panic!("Loan not past deadline");
        }

        loan.status = LoanStatus::Defaulted;
        env.storage().persistent().set(&DataKey::Loan(loan_id), &loan);

        let cr_address: Address = env.storage().instance().get(&DataKey::CreditRatingContract).unwrap();
        let _: () = env.invoke_contract(
            &cr_address,
            &Symbol::new(&env, "update_score"),
            soroban_sdk::vec![&env, loan.borrower.into_val(&env), (-50i32).into_val(&env)]
        );

        env.events().publish((Symbol::new(&env, "loan_defaulted"), loan_id), loan.borrower);
    }
    
    pub fn get_loan(env: Env, loan_id: u64) -> Loan {
        env.storage().persistent().get(&DataKey::Loan(loan_id)).expect("Loan not found")
    }

    pub fn get_loan_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::LoanCounter).unwrap_or(0u64)
    }
}

mod test;

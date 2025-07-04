use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::Serialize;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdStore = StableBTreeMap<u8, u64, Memory>;
type InvestmentStore = StableBTreeMap<u64, Investment, Memory>;
type TransactionStore = StableBTreeMap<u64, Transaction, Memory>;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Investment {
    pub id: u64,
    pub user_id: Principal,
    pub property_id: u64,
    pub tokens_owned: u64,
    pub investment_amount: u64, // in USD cents
    pub current_value: u64, // in USD cents
    pub purchase_date: u64,
    pub is_active: bool,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Transaction {
    pub id: u64,
    pub user_id: Principal,
    pub property_id: u64,
    pub transaction_type: String, // "purchase", "dividend", "sale"
    pub amount: u64, // in USD cents
    pub tokens: u64,
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreateInvestmentRequest {
    pub property_id: u64,
    pub tokens_to_purchase: u64,
    pub investment_amount: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct PortfolioSummary {
    pub total_value: u64,
    pub total_investments: u64,
    pub active_properties: u64,
    pub total_returns: u64,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static ID_COUNTER: RefCell<IdStore> = RefCell::new(
        IdStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static INVESTMENT_STORAGE: RefCell<InvestmentStore> = RefCell::new(
        InvestmentStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static TRANSACTION_STORAGE: RefCell<TransactionStore> = RefCell::new(
        TransactionStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
}

#[init]
fn init() {
    // Initialize ID counters
    ID_COUNTER.with(|counter| {
        counter.borrow_mut().insert(0, 0); // investment counter
        counter.borrow_mut().insert(1, 0); // transaction counter
    });
}

#[update]
fn create_investment(req: CreateInvestmentRequest) -> Result<Investment, String> {
    let caller = ic_cdk::caller();
    
    // Generate new investment ID
    let investment_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&0).unwrap_or(0);
        let new_id = current_id + 1;
        counter.insert(0, new_id);
        new_id
    });

    // Create investment record
    let investment = Investment {
        id: investment_id,
        user_id: caller,
        property_id: req.property_id,
        tokens_owned: req.tokens_to_purchase,
        investment_amount: req.investment_amount,
        current_value: req.investment_amount, // Initially same as investment
        purchase_date: time(),
        is_active: true,
    };

    // Store investment
    INVESTMENT_STORAGE.with(|storage| {
        storage.borrow_mut().insert(investment_id, investment.clone());
    });

    // Create transaction record
    create_transaction_record(
        caller,
        req.property_id,
        "purchase".to_string(),
        req.investment_amount,
        req.tokens_to_purchase,
    );

    Ok(investment)
}

fn create_transaction_record(
    user_id: Principal,
    property_id: u64,
    transaction_type: String,
    amount: u64,
    tokens: u64,
) -> u64 {
    let transaction_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&1).unwrap_or(0);
        let new_id = current_id + 1;
        counter.insert(1, new_id);
        new_id
    });

    let transaction = Transaction {
        id: transaction_id,
        user_id,
        property_id,
        transaction_type,
        amount,
        tokens,
        timestamp: time(),
    };

    TRANSACTION_STORAGE.with(|storage| {
        storage.borrow_mut().insert(transaction_id, transaction);
    });

    transaction_id
}

#[query]
fn get_user_investments(user_id: Principal) -> Vec<Investment> {
    INVESTMENT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, investment)| investment.user_id == user_id && investment.is_active)
            .map(|(_, investment)| investment)
            .collect()
    })
}

#[query]
fn get_property_investments(property_id: u64) -> Vec<Investment> {
    INVESTMENT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, investment)| investment.property_id == property_id && investment.is_active)
            .map(|(_, investment)| investment)
            .collect()
    })
}

#[query]
fn get_user_transactions(user_id: Principal) -> Vec<Transaction> {
    TRANSACTION_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, transaction)| transaction.user_id == user_id)
            .map(|(_, transaction)| transaction)
            .collect()
    })
}

#[query]
fn get_user_portfolio_summary(user_id: Principal) -> PortfolioSummary {
    let investments = get_user_investments(user_id);
    
    let total_value = investments.iter().map(|inv| inv.current_value).sum();
    let total_investments = investments.iter().map(|inv| inv.investment_amount).sum();
    let active_properties = investments.len() as u64;
    let total_returns = if total_value > total_investments {
        total_value - total_investments
    } else {
        0
    };

    PortfolioSummary {
        total_value,
        total_investments,
        active_properties,
        total_returns,
    }
}

#[update]
fn update_investment_value(investment_id: u64, new_value: u64) -> Result<Investment, String> {
    INVESTMENT_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut investment) = storage.get(&investment_id) {
            investment.current_value = new_value;
            storage.insert(investment_id, investment.clone());
            Ok(investment)
        } else {
            Err("Investment not found".to_string())
        }
    })
}

#[update]
fn process_dividend(
    user_id: Principal,
    property_id: u64,
    dividend_amount: u64,
) -> Result<u64, String> {
    // Create dividend transaction
    let transaction_id = create_transaction_record(
        user_id,
        property_id,
        "dividend".to_string(),
        dividend_amount,
        0, // No tokens involved in dividend
    );

    Ok(transaction_id)
}

#[query]
fn get_total_tokens_by_property(property_id: u64) -> u64 {
    INVESTMENT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, investment)| investment.property_id == property_id && investment.is_active)
            .map(|(_, investment)| investment.tokens_owned)
            .sum()
    })
}

#[query]
fn get_user_tokens_for_property(user_id: Principal, property_id: u64) -> u64 {
    INVESTMENT_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, investment)| {
                investment.user_id == user_id 
                && investment.property_id == property_id 
                && investment.is_active
            })
            .map(|(_, investment)| investment.tokens_owned)
            .sum()
    })
}

// Export candid interface
ic_cdk::export_candid!();
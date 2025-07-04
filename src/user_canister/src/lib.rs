use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::Serialize;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type UserStore = StableBTreeMap<Principal, User, Memory>;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct User {
    pub principal: Principal,
    pub email: String,
    pub name: String,
    pub kyc_status: String, // "pending", "verified", "rejected"
    pub wallet_address: String,
    pub registration_date: u64,
    pub is_active: bool,
    pub total_investments: u64, // in USD cents
    pub portfolio_value: u64, // in USD cents
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub name: String,
    pub wallet_address: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdateKycStatusRequest {
    pub user_principal: Principal,
    pub new_status: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdatePortfolioRequest {
    pub user_principal: Principal,
    pub total_investments: u64,
    pub portfolio_value: u64,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static USER_STORAGE: RefCell<UserStore> = RefCell::new(
        UserStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
}

#[init]
fn init() {
    // Initialize user storage
}

#[update]
fn create_user(req: CreateUserRequest) -> Result<User, String> {
    let caller = ic_cdk::caller();
    
    // Check if user already exists
    let existing_user = USER_STORAGE.with(|storage| {
        storage.borrow().get(&caller)
    });

    if existing_user.is_some() {
        return Err("User already exists".to_string());
    }

    let user = User {
        principal: caller,
        email: req.email,
        name: req.name,
        kyc_status: "pending".to_string(),
        wallet_address: req.wallet_address,
        registration_date: time(),
        is_active: true,
        total_investments: 0,
        portfolio_value: 0,
    };

    USER_STORAGE.with(|storage| {
        storage.borrow_mut().insert(caller, user.clone());
    });

    Ok(user)
}

#[query]
fn get_user(user_principal: Principal) -> Option<User> {
    USER_STORAGE.with(|storage| {
        storage.borrow().get(&user_principal)
    })
}

#[query]
fn get_current_user() -> Option<User> {
    let caller = ic_cdk::caller();
    get_user(caller)
}

#[query]
fn get_all_users() -> Vec<User> {
    USER_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .map(|(_, user)| user)
            .collect()
    })
}

#[query]
fn get_verified_users() -> Vec<User> {
    USER_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, user)| user.kyc_status == "verified" && user.is_active)
            .map(|(_, user)| user)
            .collect()
    })
}

#[update]
fn update_kyc_status(req: UpdateKycStatusRequest) -> Result<User, String> {
    USER_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut user) = storage.get(&req.user_principal) {
            user.kyc_status = req.new_status;
            storage.insert(req.user_principal, user.clone());
            Ok(user)
        } else {
            Err("User not found".to_string())
        }
    })
}

#[update]
fn update_user_profile(name: String, email: String) -> Result<User, String> {
    let caller = ic_cdk::caller();
    
    USER_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut user) = storage.get(&caller) {
            user.name = name;
            user.email = email;
            storage.insert(caller, user.clone());
            Ok(user)
        } else {
            Err("User not found".to_string())
        }
    })
}

#[update]
fn update_portfolio_value(req: UpdatePortfolioRequest) -> Result<User, String> {
    USER_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut user) = storage.get(&req.user_principal) {
            user.total_investments = req.total_investments;
            user.portfolio_value = req.portfolio_value;
            storage.insert(req.user_principal, user.clone());
            Ok(user)
        } else {
            Err("User not found".to_string())
        }
    })
}

#[update]
fn deactivate_user(user_principal: Principal) -> Result<User, String> {
    USER_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut user) = storage.get(&user_principal) {
            user.is_active = false;
            storage.insert(user_principal, user.clone());
            Ok(user)
        } else {
            Err("User not found".to_string())
        }
    })
}

#[query]
fn get_user_by_email(email: String) -> Option<User> {
    USER_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .find(|(_, user)| user.email == email)
            .map(|(_, user)| user)
    })
}

#[query]
fn get_user_by_wallet(wallet_address: String) -> Option<User> {
    USER_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .find(|(_, user)| user.wallet_address == wallet_address)
            .map(|(_, user)| user)
    })
}

#[query]
fn get_user_stats() -> (u64, u64, u64) {
    USER_STORAGE.with(|storage| {
        let users: Vec<User> = storage
            .borrow()
            .iter()
            .map(|(_, user)| user)
            .collect();
        
        let total_users = users.len() as u64;
        let verified_users = users.iter().filter(|u| u.kyc_status == "verified").count() as u64;
        let active_users = users.iter().filter(|u| u.is_active).count() as u64;
        
        (total_users, verified_users, active_users)
    })
}

// Export candid interface
ic_cdk::export_candid!();
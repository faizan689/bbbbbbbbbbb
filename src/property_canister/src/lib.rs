use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Serialize;
use std::cell::RefCell;
use std::borrow::Cow;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdStore = StableBTreeMap<u8, u64, Memory>;
type PropertyStore = StableBTreeMap<u64, Property, Memory>;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Property {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub location: String,
    pub property_type: String,
    pub total_value: u64, // in USD cents
    pub total_tokens: u64,
    pub available_tokens: u64,
    pub expected_roi: String, // percentage as string
    pub min_investment: u64, // in USD cents
    pub image_url: String,
    pub is_active: bool,
    pub created_at: u64,
    pub owner: Principal,
}

impl Storable for Property {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreatePropertyRequest {
    pub title: String,
    pub description: String,
    pub location: String,
    pub property_type: String,
    pub total_value: u64,
    pub total_tokens: u64,
    pub expected_roi: String,
    pub min_investment: u64,
    pub image_url: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdateTokensRequest {
    pub property_id: u64,
    pub tokens_purchased: u64,
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

    static PROPERTY_STORAGE: RefCell<PropertyStore> = RefCell::new(
        PropertyStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
}

#[init]
fn init() {
    // Initialize the ID counter
    ID_COUNTER.with(|counter| {
        counter.borrow_mut().insert(0, 0);
    });
}

#[update]
fn create_property(req: CreatePropertyRequest) -> Result<Property, String> {
    let caller = ic_cdk::caller();
    
    // Generate new ID
    let id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&0).unwrap_or(0);
        let new_id = current_id + 1;
        counter.insert(0, new_id);
        new_id
    });

    let property = Property {
        id,
        title: req.title,
        description: req.description,
        location: req.location,
        property_type: req.property_type,
        total_value: req.total_value,
        total_tokens: req.total_tokens,
        available_tokens: req.total_tokens, // Initially all tokens are available
        expected_roi: req.expected_roi,
        min_investment: req.min_investment,
        image_url: req.image_url,
        is_active: true,
        created_at: time(),
        owner: caller,
    };

    PROPERTY_STORAGE.with(|storage| {
        storage.borrow_mut().insert(id, property.clone());
    });

    Ok(property)
}

#[query]
fn get_properties() -> Vec<Property> {
    PROPERTY_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .map(|(_, property)| property)
            .collect()
    })
}

#[query]
fn get_property(id: u64) -> Option<Property> {
    PROPERTY_STORAGE.with(|storage| {
        storage.borrow().get(&id)
    })
}

#[query]
fn get_active_properties() -> Vec<Property> {
    PROPERTY_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, property)| property.is_active)
            .map(|(_, property)| property)
            .collect()
    })
}

#[update]
fn update_available_tokens(req: UpdateTokensRequest) -> Result<Property, String> {
    PROPERTY_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut property) = storage.get(&req.property_id) {
            // Check if enough tokens are available
            if property.available_tokens < req.tokens_purchased {
                return Err("Not enough tokens available".to_string());
            }
            
            // Update available tokens
            property.available_tokens -= req.tokens_purchased;
            storage.insert(req.property_id, property.clone());
            
            Ok(property)
        } else {
            Err("Property not found".to_string())
        }
    })
}

#[update]
fn toggle_property_status(property_id: u64) -> Result<Property, String> {
    let caller = ic_cdk::caller();
    
    PROPERTY_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        
        if let Some(mut property) = storage.get(&property_id) {
            // Only owner can toggle status
            if property.owner != caller {
                return Err("Only property owner can toggle status".to_string());
            }
            
            property.is_active = !property.is_active;
            storage.insert(property_id, property.clone());
            
            Ok(property)
        } else {
            Err("Property not found".to_string())
        }
    })
}

#[query]
fn get_properties_by_owner(owner: Principal) -> Vec<Property> {
    PROPERTY_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, property)| property.owner == owner)
            .map(|(_, property)| property)
            .collect()
    })
}

// Export candid interface
ic_cdk::export_candid!();
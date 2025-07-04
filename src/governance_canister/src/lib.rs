use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{init, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::Serialize;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdStore = StableBTreeMap<u8, u64, Memory>;
type ProposalStore = StableBTreeMap<u64, Proposal, Memory>;
type VoteStore = StableBTreeMap<u64, Vote, Memory>;

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Proposal {
    pub id: u64,
    pub property_id: u64,
    pub title: String,
    pub description: String,
    pub proposal_type: String, // "maintenance", "improvement", "sale", "dividend"
    pub proposer: Principal,
    pub votes_for: u64,
    pub votes_against: u64,
    pub voting_power_for: u64,
    pub voting_power_against: u64,
    pub status: String, // "active", "passed", "rejected", "executed"
    pub created_at: u64,
    pub voting_deadline: u64,
    pub execution_data: Option<String>, // JSON data for execution
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Vote {
    pub id: u64,
    pub proposal_id: u64,
    pub voter: Principal,
    pub vote_power: u64, // Based on token ownership
    pub vote_choice: bool, // true = for, false = against
    pub timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CreateProposalRequest {
    pub property_id: u64,
    pub title: String,
    pub description: String,
    pub proposal_type: String,
    pub voting_duration_days: u64,
    pub execution_data: Option<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct CastVoteRequest {
    pub proposal_id: u64,
    pub vote_choice: bool,
    pub voting_power: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct ProposalResult {
    pub proposal: Proposal,
    pub total_voting_power: u64,
    pub participation_rate: f64,
    pub approval_rate: f64,
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

    static PROPOSAL_STORAGE: RefCell<ProposalStore> = RefCell::new(
        ProposalStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static VOTE_STORAGE: RefCell<VoteStore> = RefCell::new(
        VoteStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
}

#[init]
fn init() {
    // Initialize ID counters
    ID_COUNTER.with(|counter| {
        counter.borrow_mut().insert(0, 0); // proposal counter
        counter.borrow_mut().insert(1, 0); // vote counter
    });
}

#[update]
fn create_proposal(req: CreateProposalRequest) -> Result<Proposal, String> {
    let caller = ic_cdk::caller();
    
    // Generate new proposal ID
    let proposal_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&0).unwrap_or(0);
        let new_id = current_id + 1;
        counter.insert(0, new_id);
        new_id
    });

    let current_time = time();
    let voting_deadline = current_time + (req.voting_duration_days * 24 * 60 * 60 * 1_000_000_000);

    let proposal = Proposal {
        id: proposal_id,
        property_id: req.property_id,
        title: req.title,
        description: req.description,
        proposal_type: req.proposal_type,
        proposer: caller,
        votes_for: 0,
        votes_against: 0,
        voting_power_for: 0,
        voting_power_against: 0,
        status: "active".to_string(),
        created_at: current_time,
        voting_deadline,
        execution_data: req.execution_data,
    };

    PROPOSAL_STORAGE.with(|storage| {
        storage.borrow_mut().insert(proposal_id, proposal.clone());
    });

    Ok(proposal)
}

#[update]
fn cast_vote(req: CastVoteRequest) -> Result<Vote, String> {
    let caller = ic_cdk::caller();
    
    // Check if proposal exists and is active
    let proposal = PROPOSAL_STORAGE.with(|storage| {
        storage.borrow().get(&req.proposal_id)
    });

    let proposal = match proposal {
        Some(p) => p,
        None => return Err("Proposal not found".to_string()),
    };

    if proposal.status != "active" {
        return Err("Proposal is not active".to_string());
    }

    if time() > proposal.voting_deadline {
        return Err("Voting deadline has passed".to_string());
    }

    // Check if user already voted
    let existing_vote = VOTE_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .find(|(_, vote)| {
                vote.proposal_id == req.proposal_id && vote.voter == caller
            })
            .map(|(_, vote)| vote)
    });

    if existing_vote.is_some() {
        return Err("User has already voted on this proposal".to_string());
    }

    // Generate new vote ID
    let vote_id = ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&1).unwrap_or(0);
        let new_id = current_id + 1;
        counter.insert(1, new_id);
        new_id
    });

    // Create vote record
    let vote = Vote {
        id: vote_id,
        proposal_id: req.proposal_id,
        voter: caller,
        vote_power: req.voting_power,
        vote_choice: req.vote_choice,
        timestamp: time(),
    };

    // Store vote
    VOTE_STORAGE.with(|storage| {
        storage.borrow_mut().insert(vote_id, vote.clone());
    });

    // Update proposal vote counts
    PROPOSAL_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if let Some(mut proposal) = storage.get(&req.proposal_id) {
            if req.vote_choice {
                proposal.votes_for += 1;
                proposal.voting_power_for += req.voting_power;
            } else {
                proposal.votes_against += 1;
                proposal.voting_power_against += req.voting_power;
            }
            storage.insert(req.proposal_id, proposal);
        }
    });

    Ok(vote)
}

#[query]
fn get_proposals() -> Vec<Proposal> {
    PROPOSAL_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .map(|(_, proposal)| proposal)
            .collect()
    })
}

#[query]
fn get_active_proposals() -> Vec<Proposal> {
    let current_time = time();
    PROPOSAL_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, proposal)| {
                proposal.status == "active" && proposal.voting_deadline > current_time
            })
            .map(|(_, proposal)| proposal)
            .collect()
    })
}

#[query]
fn get_proposal(proposal_id: u64) -> Option<Proposal> {
    PROPOSAL_STORAGE.with(|storage| {
        storage.borrow().get(&proposal_id)
    })
}

#[query]
fn get_property_proposals(property_id: u64) -> Vec<Proposal> {
    PROPOSAL_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, proposal)| proposal.property_id == property_id)
            .map(|(_, proposal)| proposal)
            .collect()
    })
}

#[query]
fn get_proposal_votes(proposal_id: u64) -> Vec<Vote> {
    VOTE_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, vote)| vote.proposal_id == proposal_id)
            .map(|(_, vote)| vote)
            .collect()
    })
}

#[query]
fn get_user_votes(user_id: Principal) -> Vec<Vote> {
    VOTE_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter(|(_, vote)| vote.voter == user_id)
            .map(|(_, vote)| vote)
            .collect()
    })
}

#[update]
fn update_proposal_status(proposal_id: u64, new_status: String) -> Result<Proposal, String> {
    PROPOSAL_STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        if let Some(mut proposal) = storage.get(&proposal_id) {
            proposal.status = new_status;
            storage.insert(proposal_id, proposal.clone());
            Ok(proposal)
        } else {
            Err("Proposal not found".to_string())
        }
    })
}

#[query]
fn get_proposal_result(proposal_id: u64) -> Option<ProposalResult> {
    let proposal = get_proposal(proposal_id)?;
    
    let total_voting_power = proposal.voting_power_for + proposal.voting_power_against;
    let total_votes = proposal.votes_for + proposal.votes_against;
    
    let participation_rate = if total_votes > 0 {
        total_votes as f64 / 100.0 // Simplified calculation
    } else {
        0.0
    };
    
    let approval_rate = if total_voting_power > 0 {
        proposal.voting_power_for as f64 / total_voting_power as f64
    } else {
        0.0
    };

    Some(ProposalResult {
        proposal,
        total_voting_power,
        participation_rate,
        approval_rate,
    })
}

// Export candid interface
ic_cdk::export_candid!();
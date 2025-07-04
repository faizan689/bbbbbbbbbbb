// Environment configuration for ICP deployment
export const config = {
  // ICP Configuration
  ICP_HOST: import.meta.env.VITE_ICP_HOST || 'http://localhost:4943',
  INTERNET_IDENTITY_URL: import.meta.env.VITE_INTERNET_IDENTITY_URL || 'http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
  
  // Canister IDs (will be set during deployment) - using valid test canister IDs
  PROPERTY_CANISTER_ID: import.meta.env.VITE_PROPERTY_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  INVESTMENT_CANISTER_ID: import.meta.env.VITE_INVESTMENT_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  USER_CANISTER_ID: import.meta.env.VITE_USER_CANISTER_ID || 'renrk-eyaaa-aaaaa-aaada-cai',
  GOVERNANCE_CANISTER_ID: import.meta.env.VITE_GOVERNANCE_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
  
  // Environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};
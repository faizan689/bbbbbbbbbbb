#!/bin/bash

# RealtyChain ICP Deployment Script
# This script builds and deploys the Rust canisters to local ICP replica

echo "🚀 Building RealtyChain ICP Canisters..."

# Start local ICP replica (if not already running)
echo "📡 Starting local ICP replica..."
dfx start --clean --background

# Build all canisters
echo "🔨 Building Rust canisters..."
dfx build

# Deploy all canisters
echo "🌍 Deploying canisters to local replica..."
dfx deploy

# Initialize canisters with sample data
echo "📊 Initializing with sample data..."

# Create sample properties
dfx canister call property_canister create_property '(
  record {
    title = "Manhattan Luxury Residences";
    description = "Premium apartment complex in the heart of Manhattan with high-end amenities.";
    location = "New York, NY";
    property_type = "Residential";
    total_value = 4200000;
    total_tokens = 4200;
    expected_roi = "14.20";
    min_investment = 1000;
    image_url = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400";
  }
)'

dfx canister call property_canister create_property '(
  record {
    title = "Silicon Valley Tech Campus";
    description = "Modern office complex in the heart of Silicon Valley tech district.";
    location = "Palo Alto, CA";
    property_type = "Commercial";
    total_value = 8500000;
    total_tokens = 8500;
    expected_roi = "12.80";
    min_investment = 2500;
    image_url = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400";
  }
)'

echo "✅ ICP deployment completed!"
echo ""
echo "🔗 Canister URLs:"
dfx canister id property_canister && echo "Property Canister: http://127.0.0.1:4943/?canisterId=$(dfx canister id property_canister)"
dfx canister id investment_canister && echo "Investment Canister: http://127.0.0.1:4943/?canisterId=$(dfx canister id investment_canister)"
dfx canister id governance_canister && echo "Governance Canister: http://127.0.0.1:4943/?canisterId=$(dfx canister id governance_canister)"
dfx canister id user_canister && echo "User Canister: http://127.0.0.1:4943/?canisterId=$(dfx canister id user_canister)"

echo ""
echo "🎯 Your RealtyChain app now has:"
echo "   ✓ Traditional Node.js backend (currently running)"
echo "   ✓ ICP Rust canisters (blockchain backend)"
echo "   ✓ Dual connectivity for impressive demo"
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting CipheredSupplyLedger deployment to Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.1")) {
    console.warn("⚠️  WARNING: Low balance! Make sure you have enough ETH for deployment\n");
  }

  // Deploy contract
  console.log("📦 Deploying SimplifiedSupplyLedger contract...");
  const SimplifiedSupplyLedger = await hre.ethers.getContractFactory("SimplifiedSupplyLedger");

  const contract = await SimplifiedSupplyLedger.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ SimplifiedSupplyLedger deployed to:", contractAddress);
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Deployment confirmed!\n");

  // Display contract info
  console.log("📋 Contract Deployment Summary:");
  console.log("================================");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network: Sepolia (Chain ID: 11155111)");
  console.log("Transaction Hash:", contract.deploymentTransaction().hash);
  console.log("================================\n");

  // Read initial state
  try {
    const owner = await contract.owner();
    const stats = await contract.getSupplyStats();

    console.log("📊 Initial Contract State:");
    console.log("Owner:", owner);
    console.log("Total Shipments:", stats[0].toString());
    console.log("Delivered:", stats[1].toString());
    console.log("Active:", stats[2].toString());
    console.log();
  } catch (error) {
    console.log("⚠️  Could not read initial state (this is normal)");
  }

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: contract.deploymentTransaction().blockNumber,
  };

  const fs = require("fs");
  const path = require("path");

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, "sepolia-latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployments/sepolia-latest.json\n");

  // Next steps
  console.log("🎯 Next Steps:");
  console.log("1. Update webapp/.env with:");
  console.log(`   VITE_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS=${contractAddress}`);
  console.log("\n2. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("\n3. Grant roles (if needed):");
  console.log("   - Customs Officer: contract.grantCustomsOfficer(address)");
  console.log("   - Quality Inspector: contract.grantQualityInspector(address)");
  console.log("   - Logistics Manager: contract.grantLogisticsManager(address)");
  console.log("\n✨ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

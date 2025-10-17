const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TestFHE contract to Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TestFHE = await hre.ethers.getContractFactory("TestFHE");
  const contract = await TestFHE.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ TestFHE deployed to:", contractAddress);
  console.log("View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);

  // Save to env file for frontend
  const fs = require("fs");
  const envPath = "./webapp/.env";
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Add or update TEST_FHE_ADDRESS
  if (envContent.includes('VITE_TEST_FHE_ADDRESS=')) {
    envContent = envContent.replace(/VITE_TEST_FHE_ADDRESS=.*/g, `VITE_TEST_FHE_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nVITE_TEST_FHE_ADDRESS=${contractAddress}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n📝 Updated webapp/.env with TEST_FHE_ADDRESS");

  console.log("\n⏳ Please wait 5-10 minutes for Zama coprocessor to index this contract");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
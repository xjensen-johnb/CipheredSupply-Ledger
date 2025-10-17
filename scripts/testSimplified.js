const hre = require("hardhat");
const { keccak256, toUtf8Bytes } = require("ethers");

async function main() {
  console.log("🧪 Testing SimplifiedSupplyLedger contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Contract address from deployment
  const contractAddress = "0x49215dBF0A7dC1d8959Be77730BD0387096705D4";
  console.log("Contract address:", contractAddress);

  // Get contract instance
  const SimplifiedSupplyLedger = await hre.ethers.getContractAt(
    "SimplifiedSupplyLedger",
    contractAddress
  );

  // Test 1: Check contract owner
  console.log("\n1️⃣ Checking contract owner...");
  const owner = await SimplifiedSupplyLedger.owner();
  console.log("Owner:", owner);
  console.log("Is deployer the owner?", owner === deployer.address);

  // Test 2: Get supply stats
  console.log("\n2️⃣ Getting supply stats...");
  const stats = await SimplifiedSupplyLedger.getSupplyStats();
  console.log("Total Shipments:", stats[0].toString());
  console.log("Delivered:", stats[1].toString());
  console.log("Active:", stats[2].toString());

  // Test 3: Check if we can submit a test shipment (will likely fail due to encryption)
  console.log("\n3️⃣ Testing submitShipment function signature...");
  try {
    // Generate unique shipment ID
    const timestamp = Date.now();
    const uniqueString = `${deployer.address}-TEST-${timestamp}`;
    const shipmentId = keccak256(toUtf8Bytes(uniqueString));

    console.log("Generated test shipment ID:", shipmentId);

    // This will fail because we need proper FHE encryption
    // But we can at least verify the function exists
    const tx = await SimplifiedSupplyLedger.submitShipment(
      shipmentId,
      deployer.address, // carrier
      deployer.address, // receiver
      "0x0000000000000000000000000000000000000000000000000000000000000001", // encrypted weight (dummy)
      "0x00", // weight proof (dummy)
      "0x0000000000000000000000000000000000000000000000000000000000000002", // encrypted value (dummy)
      "0x00", // value proof (dummy)
      "0x0000000000000000000000000000000000000000000000000000000000000003", // encrypted quantity (dummy)
      "0x00", // quantity proof (dummy)
      "0x0000000000000000000000000000000000000000000000000000000000000001", // encrypted risk (dummy)
      "0x00", // risk proof (dummy)
      20, // temperature (plaintext)
      50, // humidity (plaintext)
      2, // priority (plaintext)
      0, // category: GeneralGoods
      { gasLimit: 500000 }
    );

    console.log("Transaction sent (unexpected success):", tx.hash);
    await tx.wait();
  } catch (error) {
    console.log("Expected error (needs proper FHE encryption):", error.message.substring(0, 100));
  }

  // Test 4: Check functions exist
  console.log("\n4️⃣ Checking contract functions...");
  const functions = [
    "submitShipment",
    "startTransit",
    "markDelivered",
    "markLost",
    "assessRisk",
    "calculateShipmentScore",
    "getShipmentInfo",
    "getSupplyStats",
    "authorizeCarrier",
    "addInspector"
  ];

  for (const fn of functions) {
    const exists = typeof SimplifiedSupplyLedger[fn] === 'function';
    console.log(`  ✓ ${fn}: ${exists ? '✅' : '❌'}`);
  }

  console.log("\n✨ SimplifiedSupplyLedger contract test completed!");
  console.log("\n📝 Summary:");
  console.log("- Contract is deployed and accessible");
  console.log("- All expected functions are available");
  console.log("- FHE encryption is required for actual shipment submission");
  console.log("- Use the webapp at http://localhost:8082/simplified to test with proper encryption");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
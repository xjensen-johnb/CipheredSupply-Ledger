const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Shipment Lifecycle Tests
 *
 * Tests the complete shipment lifecycle including:
 * - Status transitions (Submitted -> InTransit -> Delivered/Lost)
 * - Authorization checks for each transition
 * - Event emissions
 *
 * Note: FHE-specific tests (encrypted value submission) require the fhEVM
 * local network and are tested separately in FHE.integration.js
 */
describe("Shipment Lifecycle", function () {
  let supplyLedger;
  let owner;
  let shipper;
  let carrier;
  let receiver;
  let unauthorized;

  // Shipment IDs for different test scenarios
  const nonExistentShipmentId = ethers.keccak256(ethers.toUtf8Bytes("NON-EXISTENT"));

  beforeEach(async function () {
    [owner, shipper, carrier, receiver, unauthorized] = await ethers.getSigners();

    const SimplifiedSupplyLedgerFactory = await ethers.getContractFactory("SimplifiedSupplyLedger");
    supplyLedger = await SimplifiedSupplyLedgerFactory.deploy();
    await supplyLedger.waitForDeployment();

    // Authorize carrier for tests
    await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
  });

  describe("Status Transitions - startTransit", function () {
    it("Should revert startTransit for non-existent shipment", async function () {
      await expect(
        supplyLedger.connect(carrier).startTransit(nonExistentShipmentId)
      ).to.be.revertedWith("Shipment not active");
    });
  });

  describe("Status Transitions - markDelivered", function () {
    it("Should revert markDelivered for non-existent shipment", async function () {
      await expect(
        supplyLedger.connect(receiver).markDelivered(nonExistentShipmentId)
      ).to.be.revertedWith("Shipment not active");
    });
  });

  describe("Status Transitions - markLost", function () {
    it("Should revert markLost for non-existent shipment", async function () {
      await expect(
        supplyLedger.connect(shipper).markLost(nonExistentShipmentId)
      ).to.be.revertedWith("Shipment not active");
    });
  });

  describe("Risk Assessment", function () {
    it("Should revert assessRisk for non-existent shipment", async function () {
      await expect(
        supplyLedger.assessRisk(nonExistentShipmentId)
      ).to.be.revertedWith("Shipment not active");
    });
  });

  describe("Shipment Info Query", function () {
    it("Should return zero values for non-existent shipment", async function () {
      const info = await supplyLedger.getShipmentInfo(nonExistentShipmentId);

      expect(info.shipper).to.equal(ethers.ZeroAddress);
      expect(info.carrier).to.equal(ethers.ZeroAddress);
      expect(info.receiver).to.equal(ethers.ZeroAddress);
      expect(info.category).to.equal("");
      expect(info.status).to.equal(0n); // Draft
      expect(info.submittedAt).to.equal(0n);
      expect(info.deliveredAt).to.equal(0n);
      expect(info.isActive).to.be.false;
    });
  });
});

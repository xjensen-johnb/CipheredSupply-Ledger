const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Access Control Tests
 *
 * Tests role-based access control including:
 * - Owner-only functions
 * - Carrier authorization
 * - Shipper/Carrier/Receiver permissions for shipment operations
 */
describe("Access Control", function () {
  let supplyLedger;
  let owner;
  let shipper;
  let carrier;
  let receiver;
  let attacker;

  beforeEach(async function () {
    [owner, shipper, carrier, receiver, attacker] = await ethers.getSigners();

    const SimplifiedSupplyLedgerFactory = await ethers.getContractFactory("SimplifiedSupplyLedger");
    supplyLedger = await SimplifiedSupplyLedgerFactory.deploy();
    await supplyLedger.waitForDeployment();
  });

  describe("Owner-Only Functions", function () {
    it("Should allow owner to call authorizeCarrier", async function () {
      await expect(
        supplyLedger.connect(owner).authorizeCarrier(carrier.address)
      ).to.not.be.reverted;
    });

    it("Should revert when attacker calls authorizeCarrier", async function () {
      await expect(
        supplyLedger.connect(attacker).authorizeCarrier(carrier.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to call revokeCarrier", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);

      await expect(
        supplyLedger.connect(owner).revokeCarrier(carrier.address)
      ).to.not.be.reverted;
    });

    it("Should revert when attacker calls revokeCarrier", async function () {
      await expect(
        supplyLedger.connect(attacker).revokeCarrier(carrier.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to call addInspector", async function () {
      await expect(
        supplyLedger.connect(owner).addInspector(attacker.address)
      ).to.not.be.reverted;
    });

    it("Should revert when attacker calls addInspector", async function () {
      await expect(
        supplyLedger.connect(attacker).addInspector(attacker.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to call removeInspector", async function () {
      await expect(
        supplyLedger.connect(owner).removeInspector(attacker.address)
      ).to.not.be.reverted;
    });

    it("Should revert when attacker calls removeInspector", async function () {
      await expect(
        supplyLedger.connect(attacker).removeInspector(attacker.address)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("View Functions Access", function () {
    it("Should allow anyone to call getSupplyStats", async function () {
      const stats = await supplyLedger.connect(attacker).getSupplyStats();
      expect(stats.totalShipments).to.equal(0n);
    });

    it("Should allow anyone to call isCarrier", async function () {
      const result = await supplyLedger.connect(attacker).isCarrier(carrier.address);
      expect(result).to.be.false;
    });

    it("Should allow anyone to call isInspector", async function () {
      const result = await supplyLedger.connect(attacker).isInspector(attacker.address);
      expect(result).to.be.false;
    });

    it("Should allow anyone to read owner", async function () {
      const contractOwner = await supplyLedger.connect(attacker).owner();
      expect(contractOwner).to.equal(owner.address);
    });

    it("Should allow anyone to read shipmentCount", async function () {
      const count = await supplyLedger.connect(attacker).shipmentCount();
      expect(count).to.equal(0n);
    });

    it("Should allow anyone to read deliveredCount", async function () {
      const count = await supplyLedger.connect(attacker).deliveredCount();
      expect(count).to.equal(0n);
    });
  });

  describe("Carrier Authorization State", function () {
    it("Should correctly track carrier authorization state", async function () {
      // Initially not authorized
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.false;

      // Authorize
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;

      // Revoke
      await supplyLedger.connect(owner).revokeCarrier(carrier.address);
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.false;
    });

    it("Should handle multiple carriers independently", async function () {
      const carrier2 = receiver; // Use receiver as second carrier for this test

      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      await supplyLedger.connect(owner).authorizeCarrier(carrier2.address);

      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;
      expect(await supplyLedger.isCarrier(carrier2.address)).to.be.true;

      // Revoke only first carrier
      await supplyLedger.connect(owner).revokeCarrier(carrier.address);

      expect(await supplyLedger.isCarrier(carrier.address)).to.be.false;
      expect(await supplyLedger.isCarrier(carrier2.address)).to.be.true;
    });

    it("Should allow revoking non-authorized carrier without error", async function () {
      // Revoking a never-authorized carrier should not revert
      await expect(
        supplyLedger.connect(owner).revokeCarrier(attacker.address)
      ).to.not.be.reverted;
    });

    it("Should allow re-authorizing a carrier", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      await supplyLedger.connect(owner).revokeCarrier(carrier.address);
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);

      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;
    });
  });

  describe("Zero Address Handling", function () {
    it("Should allow authorizing zero address (no validation in contract)", async function () {
      // Note: The contract doesn't prevent zero address authorization
      // This test documents current behavior
      await expect(
        supplyLedger.connect(owner).authorizeCarrier(ethers.ZeroAddress)
      ).to.not.be.reverted;
    });
  });
});

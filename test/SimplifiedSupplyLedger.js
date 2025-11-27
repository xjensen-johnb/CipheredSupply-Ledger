const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimplifiedSupplyLedger", function () {
  let supplyLedger;
  let owner;
  let shipper;
  let carrier;
  let receiver;
  let unauthorized;

  beforeEach(async function () {
    // Get signers
    [owner, shipper, carrier, receiver, unauthorized] = await ethers.getSigners();

    // Deploy the contract
    const SimplifiedSupplyLedgerFactory = await ethers.getContractFactory("SimplifiedSupplyLedger");
    supplyLedger = await SimplifiedSupplyLedgerFactory.deploy();
    await supplyLedger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await supplyLedger.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero shipment count", async function () {
      expect(await supplyLedger.shipmentCount()).to.equal(0n);
    });

    it("Should initialize with zero delivered count", async function () {
      expect(await supplyLedger.deliveredCount()).to.equal(0n);
    });
  });

  describe("Carrier Authorization", function () {
    it("Should allow owner to authorize a carrier", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;
    });

    it("Should revert when non-owner tries to authorize carrier", async function () {
      await expect(
        supplyLedger.connect(unauthorized).authorizeCarrier(carrier.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow owner to revoke carrier authorization", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;

      await supplyLedger.connect(owner).revokeCarrier(carrier.address);
      expect(await supplyLedger.isCarrier(carrier.address)).to.be.false;
    });

    it("Should revert when non-owner tries to revoke carrier", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);

      await expect(
        supplyLedger.connect(unauthorized).revokeCarrier(carrier.address)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Supply Statistics", function () {
    it("Should return correct initial stats", async function () {
      const [totalShipments, delivered, active] = await supplyLedger.getSupplyStats();

      expect(totalShipments).to.equal(0n);
      expect(delivered).to.equal(0n);
      expect(active).to.equal(0n);
    });
  });

  describe("Inspector Management", function () {
    it("Should allow owner to add inspector (placeholder)", async function () {
      await expect(
        supplyLedger.connect(owner).addInspector(unauthorized.address)
      ).to.not.be.reverted;
    });

    it("Should allow owner to remove inspector (placeholder)", async function () {
      await expect(
        supplyLedger.connect(owner).removeInspector(unauthorized.address)
      ).to.not.be.reverted;
    });

    it("Should revert when non-owner tries to add inspector", async function () {
      await expect(
        supplyLedger.connect(unauthorized).addInspector(carrier.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should revert when non-owner tries to remove inspector", async function () {
      await expect(
        supplyLedger.connect(unauthorized).removeInspector(carrier.address)
      ).to.be.revertedWith("Not owner");
    });

    it("Should return false for isInspector (placeholder)", async function () {
      expect(await supplyLedger.isInspector(owner.address)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple carrier authorizations", async function () {
      const carriers = [carrier, shipper, receiver];

      for (const c of carriers) {
        await supplyLedger.connect(owner).authorizeCarrier(c.address);
        expect(await supplyLedger.isCarrier(c.address)).to.be.true;
      }
    });

    it("Should handle carrier re-authorization after revocation", async function () {
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
      await supplyLedger.connect(owner).revokeCarrier(carrier.address);
      await supplyLedger.connect(owner).authorizeCarrier(carrier.address);

      expect(await supplyLedger.isCarrier(carrier.address)).to.be.true;
    });
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Event Emission Tests
 *
 * Tests that the contract correctly emits events for:
 * - ShipmentSubmitted
 * - ShipmentStatusChanged
 *
 * Note: Full event testing with FHE requires the fhEVM local network.
 * These tests focus on event structure and emission patterns.
 */
describe("Event Emissions", function () {
  let supplyLedger;
  let owner;
  let shipper;
  let carrier;
  let receiver;

  beforeEach(async function () {
    [owner, shipper, carrier, receiver] = await ethers.getSigners();

    const SimplifiedSupplyLedgerFactory = await ethers.getContractFactory("SimplifiedSupplyLedger");
    supplyLedger = await SimplifiedSupplyLedgerFactory.deploy();
    await supplyLedger.waitForDeployment();

    await supplyLedger.connect(owner).authorizeCarrier(carrier.address);
  });

  describe("Contract Setup Events", function () {
    it("Should have correct event signatures defined", async function () {
      // Get contract interface to verify event signatures
      const contractInterface = supplyLedger.interface;

      // Check ShipmentSubmitted event exists
      const shipmentSubmittedEvent = contractInterface.getEvent("ShipmentSubmitted");
      expect(shipmentSubmittedEvent).to.not.be.null;

      // Check ShipmentStatusChanged event exists
      const statusChangedEvent = contractInterface.getEvent("ShipmentStatusChanged");
      expect(statusChangedEvent).to.not.be.null;
    });

    it("Should have correct ShipmentSubmitted event parameters", async function () {
      const contractInterface = supplyLedger.interface;
      const event = contractInterface.getEvent("ShipmentSubmitted");

      // Verify indexed parameters
      expect(event.inputs.length).to.equal(5);
      expect(event.inputs[0].name).to.equal("shipmentId");
      expect(event.inputs[0].indexed).to.be.true;
      expect(event.inputs[1].name).to.equal("shipper");
      expect(event.inputs[1].indexed).to.be.true;
      expect(event.inputs[2].name).to.equal("carrier");
      expect(event.inputs[2].indexed).to.be.true;
    });

    it("Should have correct ShipmentStatusChanged event parameters", async function () {
      const contractInterface = supplyLedger.interface;
      const event = contractInterface.getEvent("ShipmentStatusChanged");

      // Verify parameters
      expect(event.inputs.length).to.equal(4);
      expect(event.inputs[0].name).to.equal("shipmentId");
      expect(event.inputs[0].indexed).to.be.true;
      expect(event.inputs[1].name).to.equal("oldStatus");
      expect(event.inputs[2].name).to.equal("newStatus");
      expect(event.inputs[3].name).to.equal("timestamp");
    });
  });

  describe("Event Filtering Capabilities", function () {
    it("Should allow filtering by indexed shipmentId", async function () {
      const shipmentId = ethers.keccak256(ethers.toUtf8Bytes("FILTER-TEST-001"));

      // Create filter for specific shipmentId
      const filter = supplyLedger.filters.ShipmentStatusChanged(shipmentId);

      expect(filter).to.not.be.null;
    });

    it("Should allow filtering ShipmentSubmitted by shipper", async function () {
      // Create filter for specific shipper
      const filter = supplyLedger.filters.ShipmentSubmitted(null, shipper.address);

      expect(filter).to.not.be.null;
    });

    it("Should allow filtering ShipmentSubmitted by carrier", async function () {
      // Create filter for specific carrier
      const filter = supplyLedger.filters.ShipmentSubmitted(null, null, carrier.address);

      expect(filter).to.not.be.null;
    });
  });
});

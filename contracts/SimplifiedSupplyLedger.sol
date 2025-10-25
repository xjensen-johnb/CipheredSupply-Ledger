// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SimplifiedSupplyLedger
 * @notice FHE-enabled supply chain with encrypted shipment value
 * @dev Compatible with Zama relayer-sdk-js 0.2.0 and fhevmjs 0.8.0
 */
contract SimplifiedSupplyLedger is SepoliaConfig {

    enum ShipmentStatus {
        Draft,
        Submitted,
        InTransit,
        Delivered,
        Lost
    }

    struct Shipment {
        bytes32 shipmentId;
        address shipper;
        address carrier;
        address receiver;
        // Encrypted shipment value
        euint64 valueCipher;
        // Plaintext parameters
        uint256 weightKg;
        uint256 quantity;
        uint256 riskCode;
        uint256 temperature;
        uint256 humidity;
        uint256 priority;
        string category;
        ShipmentStatus status;
        uint256 submittedAt;
        uint256 deliveredAt;
        bool isActive;
    }

    address public owner;
    mapping(bytes32 => Shipment) public shipments;
    mapping(address => bool) public authorizedCarriers;

    uint256 public shipmentCount;
    uint256 public deliveredCount;

    event ShipmentSubmitted(
        bytes32 indexed shipmentId,
        address indexed shipper,
        address indexed carrier,
        string category,
        uint256 timestamp
    );

    event ShipmentStatusChanged(
        bytes32 indexed shipmentId,
        ShipmentStatus oldStatus,
        ShipmentStatus newStatus,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeCarrier(address carrier) external onlyOwner {
        authorizedCarriers[carrier] = true;
    }

    /**
     * @notice Submit shipment with encrypted value using FHE
     * @dev Uses FHE.fromExternal for proper encryption verification
     */
    function submitShipment(
        bytes32 shipmentId,
        address carrier,
        address receiver,
        // Encrypted value with proof
        externalEuint64 encryptedValue,
        bytes calldata valueProof,
        // All other params in plaintext
        uint256 weightKg,
        uint256 quantity,
        uint256 riskCode,
        uint256 temperature,
        uint256 humidity,
        uint256 priority,
        string calldata category
    ) external returns (bytes32) {
        require(shipments[shipmentId].submittedAt == 0, "Shipment exists");
        require(carrier != address(0), "Invalid carrier");
        require(receiver != address(0), "Invalid receiver");

        // Convert external encrypted input to euint64 with proof verification
        euint64 value = FHE.fromExternal(encryptedValue, valueProof);
        FHE.allow(value, address(this));
        FHE.allow(value, msg.sender);

        Shipment storage shipment = shipments[shipmentId];
        shipment.shipmentId = shipmentId;
        shipment.shipper = msg.sender;
        shipment.carrier = carrier;
        shipment.receiver = receiver;
        shipment.valueCipher = value;
        shipment.weightKg = weightKg;
        shipment.quantity = quantity;
        shipment.riskCode = riskCode;
        shipment.temperature = temperature;
        shipment.humidity = humidity;
        shipment.priority = priority;
        shipment.category = category;
        shipment.status = ShipmentStatus.Submitted;
        shipment.submittedAt = block.timestamp;
        shipment.isActive = true;

        shipmentCount++;

        emit ShipmentSubmitted(shipmentId, msg.sender, carrier, category, block.timestamp);
        emit ShipmentStatusChanged(shipmentId, ShipmentStatus.Draft, ShipmentStatus.Submitted, block.timestamp);

        return shipmentId;
    }

    function startTransit(bytes32 shipmentId) external {
        Shipment storage shipment = shipments[shipmentId];
        require(shipment.isActive, "Shipment not active");
        require(msg.sender == shipment.carrier || msg.sender == shipment.shipper, "Not authorized");
        require(shipment.status == ShipmentStatus.Submitted, "Invalid status");

        ShipmentStatus oldStatus = shipment.status;
        shipment.status = ShipmentStatus.InTransit;

        emit ShipmentStatusChanged(shipmentId, oldStatus, ShipmentStatus.InTransit, block.timestamp);
    }

    function markDelivered(bytes32 shipmentId) external {
        Shipment storage shipment = shipments[shipmentId];
        require(shipment.isActive, "Shipment not active");
        require(msg.sender == shipment.receiver || msg.sender == shipment.carrier, "Not authorized");

        ShipmentStatus oldStatus = shipment.status;
        shipment.status = ShipmentStatus.Delivered;
        shipment.deliveredAt = block.timestamp;
        shipment.isActive = false;

        deliveredCount++;

        emit ShipmentStatusChanged(shipmentId, oldStatus, ShipmentStatus.Delivered, block.timestamp);
    }

    function getShipmentInfo(bytes32 shipmentId) external view returns (
        address shipper,
        address carrier,
        address receiver,
        string memory category,
        ShipmentStatus status,
        uint256 submittedAt,
        uint256 deliveredAt,
        bool isActive,
        uint256 weightKg,
        uint256 quantity,
        uint256 riskCode,
        uint256 temperature,
        uint256 humidity,
        uint256 priority
    ) {
        Shipment storage shipment = shipments[shipmentId];
        return (
            shipment.shipper,
            shipment.carrier,
            shipment.receiver,
            shipment.category,
            shipment.status,
            shipment.submittedAt,
            shipment.deliveredAt,
            shipment.isActive,
            shipment.weightKg,
            shipment.quantity,
            shipment.riskCode,
            shipment.temperature,
            shipment.humidity,
            shipment.priority
        );
    }

    function getSupplyStats() external view returns (
        uint256 totalShipments,
        uint256 delivered,
        uint256 active
    ) {
        return (
            shipmentCount,
            deliveredCount,
            shipmentCount - deliveredCount
        );
    }

    function markLost(bytes32 shipmentId) external {
        Shipment storage shipment = shipments[shipmentId];
        require(shipment.isActive, "Shipment not active");
        require(msg.sender == shipment.shipper || msg.sender == shipment.carrier, "Not authorized");

        ShipmentStatus oldStatus = shipment.status;
        shipment.status = ShipmentStatus.Lost;
        shipment.isActive = false;

        emit ShipmentStatusChanged(shipmentId, oldStatus, ShipmentStatus.Lost, block.timestamp);
    }

    function assessRisk(bytes32 shipmentId) external view returns (bool) {
        Shipment storage shipment = shipments[shipmentId];
        require(shipment.isActive, "Shipment not active");

        // Simple risk assessment based on risk code
        return shipment.riskCode < 5; // Low risk if risk code < 5
    }

    function revokeCarrier(address carrier) external onlyOwner {
        authorizedCarriers[carrier] = false;
    }

    function addInspector(address inspector) external onlyOwner {
        // Placeholder for future inspector functionality
    }

    function removeInspector(address inspector) external onlyOwner {
        // Placeholder for future inspector functionality
    }

    function isCarrier(address account) external view returns (bool) {
        return authorizedCarriers[account];
    }

    function isInspector(address account) external view returns (bool) {
        // Placeholder for future inspector functionality
        return false;
    }
}

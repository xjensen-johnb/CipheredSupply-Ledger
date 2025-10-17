const { ethers } = require("hardhat");
const fhevmjs = require("fhevmjs");

// Initialize FHE instance
let fheInstance = null;

async function initializeFHE() {
  if (!fheInstance) {
    fheInstance = await fhevmjs.createInstance({
      chainId: 11155111, // Sepolia
      publicKey: process.env.FHE_PUBLIC_KEY,
      gatewayUrl: "https://gateway.sepolia.zama.ai",
    });
  }
  return fheInstance;
}

// Helper function to format encrypted input for contract
function toContractInput(encryptedData) {
  const bytes = ethers.getBytes(encryptedData);
  const dataWithoutPrefix = bytes.slice(1); // Remove version byte
  const hash = ethers.keccak256(dataWithoutPrefix);
  return {
    data: ethers.toBigInt(ethers.dataSlice(dataWithoutPrefix, 0, 32)),
    hash: hash,
  };
}

// Helper function to format proof bytes
function toProofBytes(proof) {
  return ethers.getBytes(proof);
}

async function encryptUint8(value, contractAddress, userAddress) {
  const fhe = await initializeFHE();
  const encrypted = await fhe.encrypt8(value, contractAddress, userAddress);
  return {
    input: toContractInput(encrypted.data),
    proof: toProofBytes(encrypted.proof),
    data: encrypted.data,
  };
}

async function encryptUint16(value, contractAddress, userAddress) {
  const fhe = await initializeFHE();
  const encrypted = await fhe.encrypt16(value, contractAddress, userAddress);
  return {
    input: toContractInput(encrypted.data),
    proof: toProofBytes(encrypted.proof),
    data: encrypted.data,
  };
}

async function encryptUint32(value, contractAddress, userAddress) {
  const fhe = await initializeFHE();
  const encrypted = await fhe.encrypt32(value, contractAddress, userAddress);
  return {
    input: toContractInput(encrypted.data),
    proof: toProofBytes(encrypted.proof),
    data: encrypted.data,
  };
}

async function encryptUint64(value, contractAddress, userAddress) {
  const fhe = await initializeFHE();
  const encrypted = await fhe.encrypt64(value, contractAddress, userAddress);
  return {
    input: toContractInput(encrypted.data),
    proof: toProofBytes(encrypted.proof),
    data: encrypted.data,
  };
}

module.exports = {
  initializeFHE,
  encryptUint8,
  encryptUint16,
  encryptUint32,
  encryptUint64,
  toContractInput,
  toProofBytes,
};
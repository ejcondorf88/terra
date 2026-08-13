// Plugins principales
require("@nomicfoundation/hardhat-toolbox");
// Si prefieres granularidad, puedes usar:
// require("@nomiclabs/hardhat-ethers");

require("solidity-coverage");
require("hardhat-gas-reporter");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    // Agrega aquí tus redes si las necesitas (goerli, sepolia, mainnet, etc.)
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.CMC_API_KEY || "",
    outputFile: "gas-report.txt",
    noColors: true,
  },
};

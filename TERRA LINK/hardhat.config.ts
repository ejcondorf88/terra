import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
      },
    ],
  },
  paths: {
    sources: 'contracts',
    tests: 'contracts/test',
    cache: 'cache/hardhat',
    artifacts: 'artifacts',
  },
  mocha: {
    timeout: 200000,
  },
};

export default config;

import { ethers } from 'ethers';

async function runTransferExample() {
  const rpcUrl = process.env.ETH_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('ETH_RPC_URL and PRIVATE_KEY must be configured');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Connected wallet:', wallet.address);

  const network = await provider.getNetwork();
  console.log('Chain ID:', network.chainId.toString());

  const tx = await wallet.sendTransaction({
    to: '0x0000000000000000000000000000000000000000',
    value: ethers.parseEther('0.001'),
  });

  console.log('Transaction hash:', tx.hash);
  const receipt = await tx.wait();
  console.log('Receipt:', receipt);
}

runTransferExample().catch((error) => {
  console.error('Transfer example failed:', error);
  process.exit(1);
});

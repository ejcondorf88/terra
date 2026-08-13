'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      console.log("Wallet conectada:", addr);
    } else {
      alert("MetaMask no está instalado");
    }
  }

  return (
    <div>
      <button onClick={connectWallet} className="bg-blue-500 text-white p-2 rounded">
        Conectar Wallet
      </button>
      {address && <p>Dirección: {address}</p>}
    </div>
  );
}
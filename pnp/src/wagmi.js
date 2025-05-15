import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet,phantomWallet } from '@rainbow-me/rainbowkit/wallets';

const ankrSepoliaRpcUrl = 'https://rpc.ankr.com/eth_sepolia/1b7593c2aef2663e897c2001cbb3fe4634a2811c627890f2613a0d3b27e63552';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [
        metaMaskWallet,
        injectedWallet, // Supports MetaMask and other browser extension wallets
        phantomWallet, // Adds support for Phantom wallet
      ],
    },
  ],
  {
    appName: 'PNP Protocol',
    projectId: '029b716a2ab6380293f597a77a71f2e2', // Your RainbowKit Project ID
  }
);

export const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(ankrSepoliaRpcUrl),
  },
  ssr: false, // Assuming client-side rendering
});

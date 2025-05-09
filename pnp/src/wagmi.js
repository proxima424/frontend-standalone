import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet,phantomWallet } from '@rainbow-me/rainbowkit/wallets';

const alchemyRpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/OgPHxoh1CfjVBkICZopJSd282MY-sbbs';

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
    [sepolia.id]: http(alchemyRpcUrl),
  },
  ssr: false, // Assuming client-side rendering
});

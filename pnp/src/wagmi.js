import {createConfig} from '@privy-io/wagmi';
import {base} from 'viem/chains';
import {http} from 'wagmi';

const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;
const ALCHEMY_RPC_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export const config = createConfig({
    chains: [base],
    transports: {
      [base.id]: http(ALCHEMY_RPC_URL),
    },
  });

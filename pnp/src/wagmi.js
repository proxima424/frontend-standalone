import {createConfig} from '@privy-io/wagmi';
import {base} from 'viem/chains';
import {http} from 'wagmi';


// do not be a bitch and copy the api key if you see this
const ALCHEMY_RPC_URL = `https://base-mainnet.g.alchemy.com/v2/NP7YFZmmhAO9Su3k4p9GFg0olJCLyAQE`;

export const config = createConfig({
    chains: [base],
    transports: {
      [base.id]: http(ALCHEMY_RPC_URL),
    },
  });

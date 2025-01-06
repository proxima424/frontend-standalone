import {createConfig} from '@privy-io/wagmi';
import {base} from 'viem/chains';
import {http} from 'wagmi';


export const config = createConfig({
    chains: [base], // Pass your required chains as an array
    transports: {
      [base.id]: http("https://rpc.ankr.com/base"),
    },
  });



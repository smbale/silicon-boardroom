import { http, createConfig, type Chain } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Define Somnia Chain
export const somnia = {
  id: 50311,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia', symbol: 'ST', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.somnia.network'] } },
  blockExplorers: { default: { name: 'SomniaScan', url: 'https://explorer.testnet.somnia.network' } },
  testnet: true,
} as const satisfies Chain

// Define Flare Mainnet
export const flare = {
  id: 14,
  name: 'Flare Mainnet',
  nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://flare-api.flare.network/ext/C/rpc'] } },
  blockExplorers: { default: { name: 'FlareScan', url: 'https://flarescan.com' } },
} as const satisfies Chain

// Define Coston2 (Flare Testnet)
export const coston2 = {
  id: 114,
  name: 'Coston2 Testnet',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] } },
  blockExplorers: { default: { name: 'Flare Explorer', url: 'https://coston2-explorer.flare.network' } },
  testnet: true,
} as const satisfies Chain

export const config = createConfig({
  chains: [mainnet, sepolia, somnia, flare, coston2],
  connectors: [
    injected(), // Xaman's internal browser uses the injected connector
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [somnia.id]: http(),
    [flare.id]: http(),
    [coston2.id]: http(),
  },
})

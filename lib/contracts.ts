export const WFLR_ADDRESS = '0x1D80d2202900C40124740599a739ec9A10864788' // Flare Mainnet WFLR
export const FTSO_REGISTRY_ADDRESS = '0xaD077D309bd3488804c03b9b367d2b4C4C77a6A4' // Flare Mainnet FTSO Registry

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'wad', type: 'uint256' }],
    outputs: [],
  },
] as const

export const FTSO_REGISTRY_ABI = [
  {
    name: 'getCurrentPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_symbol', type: 'string' }],
    outputs: [
      { name: '_price', type: 'uint256' },
      { name: '_timestamp', type: 'uint256' },
    ],
  },
] as const

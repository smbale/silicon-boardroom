'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()
  const chainId = useChainId()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="h-10 w-32 bg-slate-800 animate-pulse rounded-lg" />
  )

  if (isConnected) {
    return (
      <div className="flex flex-col gap-3 items-end">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Connected Wallet</span>
            <div className="text-sm font-mono text-blue-400">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 px-3 py-1.5 rounded border border-slate-700 hover:border-red-900 transition-all text-xs"
          >
            Disconnect
          </button>
        </div>

        <div className="flex gap-2">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => switchChain({ chainId: chain.id })}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter transition-all border ${
                chainId === chain.id
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Filter unique connectors by name to avoid duplicate "MetaMask" buttons
  const uniqueConnectors = connectors.filter((connector, index, self) =>
    index === self.findIndex((c) => c.name === connector.name)
  );

  return (
    <div className="flex flex-col gap-2">
      {uniqueConnectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          disabled={status === 'pending'}
        >
          {status === 'pending' ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            `Connect ${connector.name}`
          )}
        </button>
      ))}
      {error && <p className="text-red-500 text-[10px] mt-1 text-right">{error.message}</p>}
    </div>
  )
}

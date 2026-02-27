'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { ERC20_ABI, WFLR_ADDRESS } from '@/lib/contracts'
import { Loader2, ArrowRight } from 'lucide-react'

export function WrapFLR() {
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState('')
  const chainId = useChainId()
  const { isConnected } = useAccount()

  const { data: hash, isPending, writeContract, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleWrap = () => {
    if (!amount || isNaN(Number(amount))) return

    writeContract({
      address: WFLR_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'deposit',
      value: parseEther(amount),
    })
  }

  if (!mounted || !isConnected || chainId !== 14) return null

  return (
    <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mt-4">
      <p className="text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-widest">Wrap FLR to WFLR</p>
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount FLR"
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={handleWrap}
          disabled={isPending || isConfirming || !amount}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2"
        >
          {isPending || isConfirming ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>Wrap <ArrowRight className="w-3 h-3" /></>
          )}
        </button>
      </div>

      {isConfirmed && (
        <p className="text-green-500 text-[10px] mt-2 font-bold animate-pulse">
          Transaction Confirmed! WFLR added to wallet.
        </p>
      )}
      {error && (
        <p className="text-red-500 text-[10px] mt-2 truncate max-w-full">
          Error: {error.message.split('.')[0]}
        </p>
      )}
    </div>
  )
}

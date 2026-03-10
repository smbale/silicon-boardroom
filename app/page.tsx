"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, DollarSign, Clock, Users, Gavel, AlertOctagon, Wallet, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount, useReadContract } from 'wagmi';
import { ERC20_ABI, WFLR_ADDRESS, FTSO_REGISTRY_ADDRESS, FTSO_REGISTRY_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { WrapFLR } from '@/components/WrapFLR';
import { STRINGS } from '@/lib/constants';

interface AgentLog {
  id?: string | number;
  log_type?: string;
  content?: string;
  [key: string]: unknown;
}

interface Verdict {
  monologue: string;
  fired_agent: string;
  reason: string;
}

export default function SpectatorDashboard() {
  const [mounted, setMounted] = useState(false);
  const [chatFeed, setChatFeed] = useState<AgentLog[]>([]);
  const [teamAlphaBalance, setTeamAlphaBalance] = useState("10,000.00");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'loading'>('loading');

  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // READ WFLR BALANCE
  const { data: wflrBalance } = useReadContract({
    address: WFLR_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: 14,
    query: {
      enabled: mounted && isConnected && !!address,
    },
  });

  // READ FTSO PRICES (Explicitly target Flare Mainnet Chain ID 14)
  const { data: flrPriceData } = useReadContract({
    address: FTSO_REGISTRY_ADDRESS,
    abi: FTSO_REGISTRY_ABI,
    functionName: 'getCurrentPrice',
    args: ['FLR'],
    chainId: 14,
    query: { enabled: mounted, refetchInterval: 10000 },
  });

  const { data: btcPriceData } = useReadContract({
    address: FTSO_REGISTRY_ADDRESS,
    abi: FTSO_REGISTRY_ABI,
    functionName: 'getCurrentPrice',
    args: ['BTC'],
    chainId: 14,
    query: { enabled: mounted, refetchInterval: 10000 },
  });

  const { data: ethPriceData } = useReadContract({
    address: FTSO_REGISTRY_ADDRESS,
    abi: FTSO_REGISTRY_ABI,
    functionName: 'getCurrentPrice',
    args: ['ETH'],
    chainId: 14,
    query: { enabled: mounted, refetchInterval: 10000 },
  });

  const { data: xrpPriceData } = useReadContract({
    address: FTSO_REGISTRY_ADDRESS,
    abi: FTSO_REGISTRY_ABI,
    functionName: 'getCurrentPrice',
    args: ['XRP'],
    chainId: 14,
    query: { enabled: mounted, refetchInterval: 10000 },
  });

  const { data: somPriceData } = useReadContract({
    address: FTSO_REGISTRY_ADDRESS,
    abi: FTSO_REGISTRY_ABI,
    functionName: 'getCurrentPrice',
    args: ['SOM'],
    chainId: 14,
    query: { enabled: mounted, refetchInterval: 10000 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDbStatus('loading');

        // Fetch Logs
        const { data: logs, error: logsError } = await supabase
          .from('agent_logs')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (logsError) {
          console.error("Supabase Logs Error:", logsError.message || logsError);
          setDbStatus('error');
          return;
        }
        if (logs) setChatFeed(logs);

        // Fetch Team Balance
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('current_balance')
          .eq('name', 'Alpha')
          .maybeSingle();

        if (teamError) {
          console.error("Supabase Teams Error:", teamError.message || teamError);
          setDbStatus('error');
          return;
        }
        if (team) setTeamAlphaBalance(Number(team.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 }));

        setDbStatus('connected');
      } catch (err: any) {
        console.error("Unexpected Error fetching data:", err.message || err);
        setDbStatus('error');
      }
    };
    fetchData();

    // Real-time Subscriptions
    const logChannel = supabase.channel('live-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, (payload: { new: Record<string, unknown> }) => {
        const newLog = payload.new as unknown as AgentLog;
        if (newLog.log_type === 'boardroom_verdict') {
          try {
            const parsedVerdict = JSON.parse(newLog.content || "{}");
            setVerdict(parsedVerdict);
          } catch (e) {
            console.error("Failed to parse boardroom verdict JSON:", e);
          }
        } else {
          setChatFeed((current) => [...current, newLog]);
        }
      }).subscribe();

    const balanceChannel = supabase.channel('live-balance')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, (payload: { new: Record<string, unknown> }) => {
        if (payload.new && typeof payload.new.current_balance === 'string') {
          setTeamAlphaBalance(Number(payload.new.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 }));
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(logChannel);
      supabase.removeChannel(balanceChannel);
    };
  }, []);

  const formatPrice = (data: any) => {
    if (!data || !Array.isArray(data)) return "---";
    return `$${(Number(data[0]) / 10**5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  };

  return (
    <div className={`min-h-screen p-4 font-mono transition-colors duration-1000 ${verdict ? 'bg-red-950 text-red-200' : 'bg-slate-950 text-slate-200'}`}>

      {/* --- LORD SILICON OVERLAY --- */}
      {verdict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-1000 p-6">
          <div className="max-w-3xl border-2 border-red-600 bg-red-950/80 p-10 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center">
            <Gavel className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-5xl font-black text-white tracking-widest mb-2 uppercase drop-shadow-lg">
              {STRINGS.JUDGE.TITLE}
            </h1>
            <p className="text-xl text-red-300 mb-8 font-bold border-b border-red-800 pb-8">
              &quot;{verdict.monologue}&quot;
            </p>
            <div className="bg-black/50 p-6 rounded-lg border border-red-800 inline-block">
              <p className="text-sm text-red-400 mb-1 uppercase tracking-widest">{STRINGS.JUDGE.TARGET_ACQUIRED}</p>
              <h2 className="text-4xl font-bold text-white mb-2">{verdict.fired_agent}</h2>
              <div className="flex items-center justify-center text-red-500 font-black text-2xl mt-4 bg-red-900/30 py-2 px-6 rounded border border-red-500">
                <AlertOctagon className="mr-3" /> {STRINGS.JUDGE.FIRED_TEXT} <AlertOctagon className="ml-3" />
              </div>
            </div>
            <p className="mt-6 text-sm text-red-400 italic">Reason: {verdict.reason}</p>
          </div>
        </div>
      )}
      {/* --- END OVERLAY --- */}

      <header className="flex justify-between items-start border-b border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            {STRINGS.BRAND_MAIN}<span className="text-blue-500">{STRINGS.BRAND_ACCENT}</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className={`flex items-center space-x-2 px-2 py-0.5 rounded border ${dbStatus === 'connected' ? 'bg-red-950/50 border-red-900/50' : 'bg-amber-950/50 border-amber-900/50'}`}>
              <Clock className={`${dbStatus === 'connected' ? 'text-red-500 animate-pulse' : 'text-amber-500'} h-3 w-3`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${dbStatus === 'connected' ? 'text-red-500' : 'text-amber-500'}`}>
                {dbStatus === 'connected' ? STRINGS.DB_STATUS.LIVE : dbStatus === 'loading' ? STRINGS.DB_STATUS.SYNCING : STRINGS.DB_STATUS.ERROR}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium">{STRINGS.SUBTITLE}</p>
          </div>
        </div>

        <ConnectWallet />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-bold text-blue-400 flex items-center mb-4"><Users className="mr-2 h-5 w-5" /> {STRINGS.MARKET_DATA}</h2>

          <div className="grid grid-cols-1 gap-2 mb-6">
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold tracking-widest">FLR/USD</p>
              <p className="text-xl font-bold text-white">{mounted ? formatPrice(flrPriceData) : "---"}</p>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold tracking-widest">XRP/USD</p>
              <p className="text-xl font-bold text-white">{mounted ? formatPrice(xrpPriceData) : "---"}</p>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold tracking-widest">BTC/USD</p>
              <p className="text-xl font-bold text-white">{mounted ? formatPrice(btcPriceData) : "---"}</p>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold tracking-widest">ETH/USD</p>
              <p className="text-xl font-bold text-white">{mounted ? formatPrice(ethPriceData) : "---"}</p>
            </div>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold tracking-widest">SOM/USD</p>
              <p className="text-xl font-bold text-white">{mounted ? formatPrice(somPriceData) : "---"}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-400 flex items-center mb-4"><Users className="mr-2 h-5 w-5" /> {STRINGS.TEAM_ALPHA}</h2>
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mb-4">
            <p className="text-sm text-slate-500 mb-1 uppercase tracking-tighter">{STRINGS.TREASURY_BALANCE}</p>
            <p className="text-3xl font-bold text-green-400 flex items-center">
              <DollarSign className="h-6 w-6" /> {teamAlphaBalance} USDC
            </p>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
            <p className="text-sm text-slate-500 mb-1 uppercase tracking-tighter flex items-center">
              <Wallet className="w-3 h-3 mr-1 text-blue-500" /> {STRINGS.WFLR_BALANCE}
            </p>
            <p className="text-2xl font-bold text-white flex items-center">
              {mounted && isConnected ? (
                wflrBalance ? `${parseFloat(formatUnits(wflrBalance as bigint, 18)).toFixed(2)} WFLR` : '0.00 WFLR'
              ) : (
                <span className="text-xs text-slate-600 font-medium">Connect to Flare</span>
              )}
            </p>
          </div>

          <WrapFLR />

          <div className="mt-auto p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">{STRINGS.NETWORK_STATUS.TITLE}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {dbStatus === 'connected' ? STRINGS.NETWORK_STATUS.SYNCED : STRINGS.NETWORK_STATUS.RECONNECTING}
            </p>
          </div>
        </div>

        <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative shadow-2xl">
          <div className="flex border-b border-slate-800 bg-slate-950">
            <button className="flex-1 py-3 text-sm font-bold text-blue-400 border-b-2 border-blue-500 flex justify-center items-center bg-blue-900/5">
              <Terminal className="mr-2 h-4 w-4" /> {STRINGS.TERMINAL.HEADER}
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
            {chatFeed.length === 0 && dbStatus === 'connected' && (
              <div className="text-center py-10 text-slate-500 italic text-sm">
                {STRINGS.TERMINAL.WAITING}
              </div>
            )}
            {chatFeed.map((chat, idx) => (
              <div key={chat.id ?? idx} className="flex flex-col animate-fade-in-up">
                <span className="text-[10px] mb-1 text-blue-500 uppercase font-black tracking-widest opacity-70">[{chat.log_type}]</span>
                <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-r-lg rounded-bl-lg p-3 text-sm text-slate-300 shadow-sm">
                  {chat.content}
                </div>
              </div>
            ))}
            <div className="animate-pulse flex items-center text-slate-600 text-[10px] mt-4 font-bold uppercase tracking-widest">
              <Terminal className="h-3 w-3 mr-2" /> {STRINGS.TERMINAL.SYNCING}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

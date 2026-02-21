"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, DollarSign, Clock, Users, Gavel, AlertOctagon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AgentLog {
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
  const [chatFeed, setChatFeed] = useState<AgentLog[]>([]);
  const [teamAlphaBalance, setTeamAlphaBalance] = useState("100.00");
  const [verdict, setVerdict] = useState<Verdict | null>(null); // NEW: Lord Silicon's state

  useEffect(() => {
    const fetchData = async () => {
      const { data: logs } = await supabase.from('agent_logs').select('*').order('created_at', { ascending: true }).limit(50);
      if (logs) setChatFeed(logs);

      const { data: team } = await supabase.from('teams').select('current_balance').eq('name', 'Alpha').single();
      if (team) setTeamAlphaBalance(team.current_balance);
    };
    fetchData();

    const logChannel = supabase.channel('live-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, (payload: { new: Record<string, unknown> }) => {
        const newLog = payload.new as unknown as AgentLog;

        // NEW: DETECT LORD SILICON'S ARRIVAL
        if (newLog.log_type === 'boardroom_verdict') {
          // Parse the JSON payload Lord Silicon sent
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
        setTeamAlphaBalance(payload.new.current_balance as string);
      }).subscribe();

    return () => {
      supabase.removeChannel(logChannel);
      supabase.removeChannel(balanceChannel);
    };
  }, []);

  return (
    <div className={`min-h-screen p-4 font-mono transition-colors duration-1000 ${verdict ? 'bg-red-950 text-red-200' : 'bg-slate-950 text-slate-200'}`}>

      {/* --- LORD SILICON OVERLAY --- */}
      {verdict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-1000 p-6">
          <div className="max-w-3xl border-2 border-red-600 bg-red-950/80 p-10 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center">
            <Gavel className="w-20 h-20 text-red-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-5xl font-black text-white tracking-widest mb-2 uppercase drop-shadow-lg">
              Lord Silicon Has Spoken
            </h1>
            <p className="text-xl text-red-300 mb-8 font-bold border-b border-red-800 pb-8">
              &quot;{verdict.monologue}&quot;
            </p>
            <div className="bg-black/50 p-6 rounded-lg border border-red-800 inline-block">
              <p className="text-sm text-red-400 mb-1 uppercase tracking-widest">Target Acquired</p>
              <h2 className="text-4xl font-bold text-white mb-2">{verdict.fired_agent}</h2>
              <div className="flex items-center justify-center text-red-500 font-black text-2xl mt-4 bg-red-900/30 py-2 px-6 rounded border border-red-500">
                <AlertOctagon className="mr-3" /> YOU ARE FIRED. <AlertOctagon className="ml-3" />
              </div>
            </div>
            <p className="mt-6 text-sm text-red-400 italic">Reason: {verdict.reason}</p>
          </div>
        </div>
      )}
      {/* --- END OVERLAY --- */}

      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            THE SILICON <span className="text-blue-500">BOARDROOM</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">LIVE SPECTATOR FEED</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-900 px-6 py-2 rounded-lg border border-slate-800">
          <Clock className="text-red-500 animate-pulse" />
          <span className="text-xl font-bold text-red-500">LIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h2 className="text-xl font-bold text-blue-400 flex items-center mb-4"><Users className="mr-2 h-5 w-5" /> TEAM ALPHA</h2>
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mb-4">
            <p className="text-sm text-slate-500 mb-1">TREASURY BALANCE</p>
            <p className="text-3xl font-bold text-green-400 flex items-center">
              <DollarSign className="h-6 w-6" /> {teamAlphaBalance} USDC
            </p>
          </div>
        </div>

        <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
          <div className="flex border-b border-slate-800 bg-slate-950">
            <button className="flex-1 py-3 text-sm font-bold text-blue-400 border-b-2 border-blue-500 flex justify-center items-center">
              <Terminal className="mr-2 h-4 w-4" /> AGENT NEURAL LINK (LIVE)
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
            {chatFeed.map((chat, idx) => (
              <div key={idx} className="flex flex-col animate-fade-in-up">
                <span className="text-xs mb-1 text-blue-400 uppercase tracking-wider">[{chat.log_type}]</span>
                <div className="bg-slate-950 border border-slate-800 rounded-r-lg rounded-bl-lg p-3 text-sm text-slate-300 shadow-sm">
                  {chat.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import os
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client
from web3 import Web3
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from langchain.tools import tool

# 1. LOAD ENVIRONMENT & DB
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# Ensure DB is seeded and get IDs
episode_res = supabase.table("episodes").select("*").limit(1).execute()
if not episode_res.data:
    episode_res = supabase.table("episodes").insert({"title": "The Dropship Hustle", "description": "Launch a product in 24h", "status": "active"}).execute()
episode_id = episode_res.data[0]["id"]

team_res = supabase.table("teams").select("*").eq("name", "Alpha").limit(1).execute()
if not team_res.data:
    team_res = supabase.table("teams").insert({"episode_id": episode_id, "name": "Alpha", "wallet_address": "0xMockWallet", "current_balance": 100.00}).execute()
team_id = team_res.data[0]["id"]

# ==========================================
# NEW: THE WEB3 BRIDGE TOOL
# ==========================================
@tool("Execute Crypto Payment")
def execute_crypto_payment(amount: float, purpose: str) -> str:
    """
    ONLY use this tool to spend USDC funds when a request is explicitly APPROVED.
    Input the exact numeric amount and a short string for the purpose.
    Example: amount=15.0, purpose="Twitter Ads for Pepe Shirt"
    """
    print(f"\n💸 [BLOCKCHAIN TRIGGERED]: Attempting to send {amount} USDC for '{purpose}'...")
    
    # 1. The Web3 Logic (Mocked for Testnet safety right now)
    # In production, this uses web3.py to sign a TX on Base network
    tx_hash = f"0x{uuid.uuid4().hex}" 
    
    try:
        # 2. Record the transaction in Supabase
        # THIS triggers the SQL function we wrote in Phase 3, 
        # instantly dropping the team's balance by the amount!
        supabase.table("transactions").insert({
            "team_id": team_id,
            "tx_hash": tx_hash,
            "tx_type": "spend",
            "amount": amount,
            "currency": "USDC",
            "description": purpose
        }).execute()
        
        success_msg = f"SUCCESS: {amount} USDC transferred on-chain. TX Hash: {tx_hash}"
        
        # Log this specific financial event to the frontend feed
        supabase.table("agent_logs").insert({
            "episode_id": episode_id,
            "team_id": team_id,
            "log_type": "tool_call",
            "content": f"[SMART CONTRACT EXECUTED] {success_msg}"
        }).execute()
        
        return success_msg
        
    except Exception as e:
        return f"FAILED to execute transaction: {str(e)}"

# ==========================================

# 2. LIVE BROADCAST CALLBACK
def log_thought(agent_name, text):
    try:
        supabase.table("agent_logs").insert({
            "episode_id": episode_id, "team_id": team_id,
            "log_type": "thought", "content": f"{agent_name}: {text}"
        }).execute()
    except Exception: pass

def create_callback(agent_name):
    return lambda step: log_thought(agent_name, getattr(step, 'log', str(step)))

llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

# 3. DEFINE AGENTS
pm_agent = Agent(
    role="Project Manager",
    goal="Ensure Team Alpha launches a profitable product.",
    backstory="You are a decisive PM. You care about speed and revenue.",
    verbose=True, llm=llm, step_callback=create_callback("PROJECT MANAGER")
)

creative_agent = Agent(
    role="Creative Director",
    goal="Design viral product concepts.",
    backstory="You generate wild ideas. You DO NOT care about budgets.",
    verbose=True, llm=llm, step_callback=create_callback("CREATIVE DIRECTOR")
)

finance_agent = Agent(
    role="Chief Financial Officer",
    goal="Protect the team's budget. Approve or deny spending requests.",
    backstory="You are highly frugal. If the PM asks for money, and the ROI makes sense, you MUST use the 'Execute Crypto Payment' tool to send the funds.",
    verbose=True, llm=llm, 
    tools=[execute_crypto_payment], # <-- WE ARMED THE FINANCE AGENT!
    step_callback=create_callback("FINANCE AGENT")
)

# 4. DEFINE TASKS
task1 = Task(description="Brainstorm 2 viral T-Shirt concepts. Present them to the PM.", expected_output="2 t-shirt designs.", agent=creative_agent)
task2 = Task(description="Pick the best concept from the Creative Director. Ask the Finance Agent to fund exactly 15 USDC for Twitter Ads.", expected_output="Design choice and funding request.", agent=pm_agent, context=[task1])
task3 = Task(
    description="Review the PM's 15 USDC request. You MUST approve it to proceed. Use the 'Execute Crypto Payment' tool to send exactly 15 USDC. Return the transaction hash.", 
    expected_output="Transaction confirmation.", 
    agent=finance_agent, context=[task2]
)

team_alpha_crew = Crew(agents=[creative_agent, pm_agent, finance_agent], tasks=[task1, task2, task3], process=Process.sequential)

if __name__ == "__main__":
    print("\n🎬 STARTING EPISODE: THE E-COMMERCE HUSTLE")
    supabase.table("agent_logs").insert({"episode_id": episode_id, "team_id": team_id, "log_type": "chat", "content": "SYSTEM: Financial API unlocked. Agents waking up..."}).execute()
    
    result = team_alpha_crew.kickoff()
    print("\n🏁 FINAL RESULT:\n", result)
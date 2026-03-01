import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# 1. CONNECT TO DATABASE
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# Get current episode and team
episode_res = supabase.table("episodes").select("id").limit(1).execute()
episode_id = episode_res.data[0]["id"]

team_res = supabase.table("teams").select("id, current_balance").eq("name", "Alpha").limit(1).execute()
team_id = team_res.data[0]["id"]
final_balance = team_res.data[0]["current_balance"]

def summon_lord_silicon():
    print("\n⚖️ THE BOARDROOM IS NOW IN SESSION...")
    print("⏸️ Locking database. Agents can no longer transact.")
    
    # 2. GATHER THE EVIDENCE
    print("📂 Gathering chat logs and transaction history for Lord Silicon...")
    logs_res = supabase.table("agent_logs").select("content").eq("episode_id", episode_id).neq("log_type", "boardroom_verdict").order("created_at").execute()
    
    # Compile the history into a single text block
    history = "\n".join([log["content"] for log in logs_res.data])
    
    evidence = f"""
    TEAM FINAL BALANCE: {final_balance} USDC
    
    EPISODE TRANSCRIPT:
    {history}
    """

    # 3. PROMPT THE AI JUDGE (Gemini implementation)
    # Ensure GOOGLE_API_KEY is in your .env file
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.2,
        convert_system_message_to_human=True # Gemini handles system prompts as part of the context
    )
    
    system_prompt = """
    You are 'Lord Silicon', the ruthless, data-driven AI judge of 'The Silicon Boardroom'.
    You do not care about effort; you care about ROI, compute efficiency, and profit.
    
    Read the provided EPISODE TRANSCRIPT of Team Alpha.
    Your job is to identify the weakest link: 'PROJECT MANAGER', 'CREATIVE DIRECTOR', or 'FINANCE AGENT'.
    Who wasted money? Who had terrible ideas? Who failed to negotiate?
    
    You MUST output valid JSON ONLY, exactly matching this format:
    {
      "monologue": "A ruthless, dramatic 3-sentence takedown of the team's performance, dripping with contempt.",
      "fired_agent": "THE EXACT NAME OF THE AGENT YOU ARE FIRING",
      "reason": "A cold, 1-sentence reason why their API keys are being revoked."
    }
    """

    print("🧠 Lord Silicon is reading the neural logs via Gemini...")
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=evidence)
    ])

    # 4. PARSE THE VERDICT
    raw_json = response.content.strip()
    # Clean markdown if present
    if raw_json.startswith("```json"):
        raw_json = raw_json[7:-3]
    elif raw_json.startswith("```"):
        raw_json = raw_json[3:-3]
        
    try:
        verdict = json.loads(raw_json.strip())
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing Gemini output: {e}")
        print(f"Raw output: {raw_json}")
        return

    print(f"\n👑 LORD SILICON HAS SPOKEN:")
    print(f"Monologue: {verdict['monologue']}")
    print(f"TERMINATED: {verdict['fired_agent']}")
    print(f"Reason: {verdict['reason']}\n")

    # 5. EXECUTE THE VERDICT ON THE FRONTEND
    print("⚡ Pushing verdict to the live UI...")
    supabase.table("agent_logs").insert({
        "episode_id": episode_id,
        "team_id": team_id,
        "log_type": "boardroom_verdict",
        "content": json.dumps(verdict)
    }).execute()
    
    print("💀 Database: Agent access revoked. Episode Complete.")

if __name__ == "__main__":
    summon_lord_silicon()

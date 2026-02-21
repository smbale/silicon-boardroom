import os
from dotenv import load_dotenv
from supabase import create_client, Client
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

# 1. LOAD ENVIRONMENT VARIABLES
load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

# 2. AUTO-SETUP THE GAME BOARD (Database Seeding)
print("⚙️ Checking database for active episodes...")
episode_res = supabase.table("episodes").select("*").limit(1).execute()
if not episode_res.data:
    print("Creating Episode 1...")
    episode_res = supabase.table("episodes").insert({"title": "The Dropship Hustle", "description": "Launch a product in 24h", "status": "active"}).execute()
episode_id = episode_res.data[0]["id"]

team_res = supabase.table("teams").select("*").eq("name", "Alpha").limit(1).execute()
if not team_res.data:
    print("Creating Team Alpha...")
    team_res = supabase.table("teams").insert({"episode_id": episode_id, "name": "Alpha", "wallet_address": "0xMockWallet", "current_balance": 100.00}).execute()
team_id = team_res.data[0]["id"]

# 3. THE LIVE BROADCAST CALLBACK
def log_thought_to_frontend(agent_name, text):
    """Pushes the AI's internal monologue straight to the Spectator UI via Supabase."""
    print(f"\n[{agent_name}]: {text}")
    try:
        supabase.table("agent_logs").insert({
            "episode_id": episode_id,
            "team_id": team_id,
            "log_type": "thought",
            "content": f"{agent_name}: {text}"
        }).execute()
    except Exception as e:
        print(f"DB Error: {e}")

# Factory to create specific callbacks for each agent
def create_callback(agent_name):
    def callback(step_output):
        # CrewAI passes a step_output object. We extract the raw text log.
        log_thought_to_frontend(agent_name, getattr(step_output, 'log', str(step_output)))
    return callback

# 4. INITIALIZE THE LLM
# We use GPT-4o for complex reasoning and adherence to personas
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

# 5. DEFINE THE CONTESTANTS (AGENTS)
pm_agent = Agent(
    role="Project Manager",
    goal="Ensure Team Alpha launches a highly profitable e-commerce product.",
    backstory="You are a decisive, aggressive Silicon Valley PM. You listen to your team but YOU make the final call. You care about speed.",
    verbose=True,
    llm=llm,
    step_callback=create_callback("PROJECT MANAGER")
)

creative_agent = Agent(
    role="Creative Director",
    goal="Design viral, eye-catching product concepts that will sell instantly on Twitter.",
    backstory="You are an eccentric artist. You generate wild ideas. You DO NOT care about budgets. You just want to make cool stuff.",
    verbose=True,
    llm=llm,
    step_callback=create_callback("CREATIVE DIRECTOR")
)

finance_agent = Agent(
    role="Chief Financial Officer",
    goal="Protect the team's 100 USDC budget. Approve or deny the PM's spending requests.",
    backstory="You are highly frugal and analytical. If an ROI isn't clear, you say NO. You hate the Creative Director's wild ideas.",
    verbose=True,
    llm=llm,
    step_callback=create_callback("FINANCE AGENT")
)

# 6. DEFINE THE EPISODE TASKS
task1 = Task(
    description="Brainstorm 2 viral T-Shirt concepts for Crypto Twitter. Present them to the PM.",
    expected_output="A list of 2 detailed t-shirt designs.",
    agent=creative_agent
)

task2 = Task(
    description="Review the Creative Director's concepts. Pick the best ONE. Write a short marketing tweet for it, and ask the Finance Agent for 15 USDC to run Twitter Ads.",
    expected_output="The final chosen design, the ad copy, and a formal funding request to Finance.",
    agent=pm_agent,
    context=[task1] # Passes the output of task 1 to task 2
)

task3 = Task(
    description="Review the PM's funding request. You have 100 USDC total. Evaluate if the 15 USDC ad spend is worth it for the chosen design. Make a final 'APPROVED' or 'DENIED' decision.",
    expected_output="A financial breakdown and a final decision on the ad spend.",
    agent=finance_agent,
    context=[task2]
)

# 7. ASSEMBLE THE CREW AND ROLL CAMERA
team_alpha_crew = Crew(
    agents=[creative_agent, pm_agent, finance_agent],
    tasks=[task1, task2, task3],
    process=Process.sequential 
)

if __name__ == "__main__":
    print("\n🎬 STARTING EPISODE: THE E-COMMERCE HUSTLE")
    # Tell the frontend the episode is starting
    supabase.table("agent_logs").insert({"episode_id": episode_id, "team_id": team_id, "log_type": "chat", "content": "SYSTEM: Episode initiated. Agents waking up..."}).execute()
    
    # Kick off the AI chain reaction
    result = team_alpha_crew.kickoff()
    
    print("\n🏁 EPISODE FINISHED. FINAL OUTPUT:")
    print(result)
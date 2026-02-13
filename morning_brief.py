import os
import json
import datetime
from openclaw import tools

def get_market_intelligence():
    """Scrape top AI/Solopreneur news using Brave Search."""
    query = "AI solopreneur business trends news February 2026"
    results = tools.web_search(query=query, count=3)
    news_brief = ""
    for res in results.get('results', []):
        news_brief += f"- **{res['title']}**: {res['description'][:150]}... [Read More]({res['url']})\n"
    return news_brief or "No fresh intelligence found today."

def get_maurice_idea(news):
    """Generate a business idea based on news."""
    # Simulating Maurice's input via a prompt-like logic
    idea = "AI-Driven 'Niche Intelligence' Micro-Newsletter for small-scale investors."
    return idea

def get_tasks():
    """Fetch tasks from MEMORY.md or project files."""
    # Simplified for POC - will later pull from a central tasks.json
    tasks = ["1. Finalize NextJS Dashboard setup.", "2. Connect Supabase for Vector Memory.", "3. Review 2nd Brain architecture."]
    return "\n".join(tasks)

def generate_brief():
    news = get_market_intelligence()
    idea = get_maurice_idea(news)
    tasks = get_tasks()
    
    brief = f"""
🦁 **BARON MORNING BRIEF | {datetime.date.today()}**

📰 **Market Intelligence**
{news}

💡 **Maurice's Business Idea**
{idea}

✅ **Your Hit List**
{tasks}

🤝 **Collaborative Push**
Let's build out the NextJS 'Memory Explorer' component today. I've prepared the boilerplate logic.

*Have a high-leverage day, Robert.*
"""
    return brief

if __name__ == "__main__":
    brief_content = generate_brief()
    # Sending via the system's message tool
    tools.message(action="send", message=brief_content)

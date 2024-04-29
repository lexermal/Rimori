from crewai_tools import tool
from crewai import Crew, Process
from langchain_openai import ChatOpenAI
from agents import AISummaryAgents
from tasks import AISummaryTasks
# from file_io import save_markdown

from dotenv import load_dotenv
load_dotenv()

# Initialize the agents and tasks
agents = AISummaryAgents()
tasks = AISummaryTasks()

# Initialize the OpenAI GPT-4 language model
OpenAIGPT4 = ChatOpenAI(
    model="gpt-4"
)

@tool("summary_printer")
def summary_printer_tool(story: str) -> str:
    """Shows the summary to the user."""
    print("THE SUMMARY:\\n\\n ", story)
    
    return True

# Instantiate the agents
editor = agents.editor_agent()
news_fetcher = agents.news_fetcher_agent()
news_analyzer = agents.news_analyzer_agent()
newsletter_compiler = agents.newsletter_compiler_agent()

# Instantiate the tasks
fetch_news_task = tasks.fetch_news_task(news_fetcher, "IT")
analyze_news_task = tasks.analyze_news_task(news_analyzer, [fetch_news_task])
compile_newsletter_task = tasks.compile_newsletter_task(
    newsletter_compiler, [analyze_news_task], summary_printer_tool)

# Form the crew
crew = Crew(
    agents=[editor, news_fetcher, news_analyzer, newsletter_compiler],
    tasks=[fetch_news_task, analyze_news_task, compile_newsletter_task],
    process=Process.hierarchical,
    manager_llm=OpenAIGPT4,
    verbose=2
)

# Kick off the crew's work
results = crew.kickoff()

# Print the results
print("Crew Work Results:")
print(results)

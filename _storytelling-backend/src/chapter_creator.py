import os
import time
from crewai import Agent, Task, Crew
from crewai_tools import SerperDevTool, PDFSearchTool, TXTSearchTool
import requests

from dotenv import load_dotenv
load_dotenv()

# Loading Tools
# search_tool = SerperDevTool()
# pdf_analysis_tool = PDFSearchTool(pdf='./pdf-decision-making.pdf')
file_read_tool = TXTSearchTool(txt='./files/md-decision-making.md')

from crewai_tools import tool
@tool("chapter_continue_user_input")
def chapter_user_input_tool(question: str) -> str:
    """Human input about how the chapter should continue and why."""
    # print("This custom fuction has an input question: ", question)
    # wait for 5 seconds and log time before and after the wait
    # print("Waiting for 5 seconds")
    # time.sleep(5)
    # print("Waited for 5 seconds")
    # Get user input from cli for "how should the chapter continue and why?"
    user_input = input(question)
    
    # Function logic here
    return user_input

@tool("story_printer")
def story_printer_tool(story: str) -> str:
    """Shows the story to the user."""
    print("THE STORY CONTINUES: ", story)
    
    return True


# Creat a funtion that will be used as a tool and calles lorem picsum api to get a random image url but has as input the description of the image that should be returned
from crewai_tools import tool
@tool("image_generator")
def image_generator_tool(description: str) -> str:
    """Generates a image based on the description and returns the URL."""
    # call dalle api to get an image based on the description and download it
    response = requests.get(f"https://api.openai.com/v1/vision/prompt?text={description}", headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"})
    
    # Download the image and save it
    image_url = response.json()['choices'][0]['output']['url']
    # safe the image to a file
    with open("image.jpg", "wb") as f:
        f.write(requests.get(image_url).content)
    return image_url




# Define your agents with roles, goals, tools, and additional attributes
researcher = Agent(
  role='Senior Entrepreneruship Educator',
  goal='Uncover key insights into entrepreneurship education',
  backstory=(
    "You are a Senior Entrepreneruship Educator at a leading university for business education."
    "Your expertise lies in identifying key insights about entrepreneruship."
    "You have a knack for dissecting complex data and presenting actionable insights."
  ),
  verbose=True,
  allow_delegation=False,
  tools=[file_read_tool],
  max_rpm=100
)
task1 = Task(
  description=(
    "Conduct a comprehensive summary of the provided markdown file."
    "Identify key insights."
    "Compile your findings in a detailed summary consisting of the key insights."
    "Make sure to check with a human if the draft is good before finalizing your answer."
  ),
  expected_output='A comprehensive full summary on the insights of decison making mentioned in the markdown file, leave nothing out. The summary uses markdown format and is well structured and bullet pointed.',
  agent=researcher,
  human_input=False,
)

writer = Agent(
  role='Expert storyteller for Entrepreneruship adventures',
  goal='Craft compelling stories of the where the content of the entrepreneruship summary is integrated. Students prepare for an exam that is about the content of the summary. The story should help them train for the exam by applying their knowledge.',
  backstory=(
    "You are a renowned Entrepreneruship storyteller, known for your lively and engaging stories on entrepreneurship."
    "With a deep understanding of the Entrepreneruship industry, you transform complex concepts into compelling narratives."
      "Make sure to check with a human how they would continue the story and why."
  ),
  verbose=True,
  allow_delegation=False,
  tools=[chapter_user_input_tool, story_printer_tool,image_generator_tool],
  cache=True, 
  human_input=False
)

task2 = Task(
  description=(
    "Using the insights from the researcher's summary, develop an engaging first chapter for a story that is around the topics mentioned in the researchers report."
    "Your chapter should be entertaining, funny, yet accessible, catering to a entrepreneruship-savvy audience."
    "Aim for a narrative that captures the audiences attention."
    "Don't mention the same key terms as the summary, but rather integrate them into the story."
    "Generate one picture fitting to the story and include it."
    "The chapter builds upon some parts of the summary and integrates them into the story. At the end of the chapter the user needs to show their knowledge of the content of the summary by making a decision."    
    "The decisions the user takes decide about a happy or sad ending of the story. Don't tell the user about the happy or sad ending, but let them decide. And also don't tell them about the advantages and disadvantages of the decisions. Let them decide based on their knowledge of the content of the summary."
    "When your chapter is ready, show it to the user and ask them how they would continue the story and why."
  ),
  expected_output='A compelling 3 paragraphs chapter formatted as markdown.',
  agent=writer
)

# task3 = Task(
#   description=(
#     "Using the insights from the researcher's report, the last story chapter(s) and the users response, develop an engaging next chapter for a story that is around the topics mentioned in the researchers report."
#     "Your chapter should be entertaining, funny, yet accessible, catering to a entrepreneruship-savvy audience."
#     "Aim for a narrative that captures the audiences attention."
#     "At the end of the chapter, the reader should decide how to continue the story. Ask the reader to reflect what decision they would make and why."
#     "After 5 chapters end the story by letting the protoganist take a savage decision that will change the course of the story. Like a cliffhanger."
#   ),
#   expected_output='A compelling 3 paragraphs chapter formatted as markdown.',
#   agent=writer
# )

# Instantiate your crew with a sequential process
crew = Crew(
  agents=[researcher,writer ],
  tasks=[task1, task2],
  verbose=2
)

# Get your crew to work!
# result = crew.kickoff()

# print("##########FULL STORY############")
# print(result)
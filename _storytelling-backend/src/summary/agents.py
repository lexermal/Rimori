from crewai_tools import SerperDevTool, PDFSearchTool, TXTSearchTool
from crewai import Agent, Task, Crew


# pdf_analysis_tool = PDFSearchTool(pdf='../../files/sarasvathy.pdf')
txt_search_tool = TXTSearchTool(txt='../../files/convert/sarasvathy.md')

class AISummaryAgents():
    def logging_output(self, agent, task, output):
        print(f"{agent.role} completed the task: {task.name}")
        print(f"Output: {output}")
        print("")
    
    def editor_agent(self):
        return Agent(
            role='Editor',
            goal='Oversee the creation of the Study summary',
            backstory="""With a keen eye for detail and a passion for percision, you ensure that the summary
            not only contains all important facts but also has clear formulation. """,
            allow_delegation=True,
            tools=[txt_search_tool],
            verbose=True,
            max_iter=2,
            step_callback=self.logging_output
        )

    def news_fetcher_agent(self):
        return Agent(
            role='ScientificPaperFetcher',
            goal='Fetch the relevant information from provided scientific paper in the markdown file use the TXTSearchTool for it.',
            backstory="""As a digital sleuth, you scour the paper for the most important and relevant information
            for a summary creation, ensuring that the students preparing for an exam get to know everything.""",
            tools=[txt_search_tool],
            verbose=True,
            allow_delegation=True,
            max_iter=3,
        )

    def news_analyzer_agent(self):
        return Agent(
            role='ScientificPaperAnalyzer',
            goal='Analyze the information and generate a detailed markdown summary',
            backstory="""With a critical eye and a knack for distilling complex information, you provide percise clear formulated summary
            , making it percise and engaging for our audience.""",
            tools=[txt_search_tool],
            verbose=True,
            allow_delegation=True,
            max_iter=3,
        )

    def newsletter_compiler_agent(self):
        return Agent(
            role='SummaryCompiler',
            goal='Compile the analyzed information into a final summary format',
            backstory="""As the final architect of the summary, you meticulously arrange and format the content,
            ensuring a coherent and visually appealing presentation that captivates our readers. Make sure to follow
            summary format guidelines and maintain consistency throughout.""",
            verbose=True,
            max_iter=3,
        )
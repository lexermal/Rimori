
from crewai import Task

class AISummaryTasks():
    def fetch_news_task(self, agent,topic="IT"):
        return Task(
            description='Read important information of the provided markdown file relevant for the summary creation.',
            agent=agent,
            async_execution=True,
            expected_output="""A list of important information out of the paper like title, a brief explanation/summary for each important information. 
                Example Output: 
                [
                    {  'title': 'Concept title 1', 
                    'explanation_or_summary': 'Explanation or summary of the concept 1', 
                    'optional_example': 'Example of the concept 1',
                    'Other': 'Other information of the concept 1'
                    }, 
                    {{...}}
                ]
            """
        )

    def analyze_news_task(self, agent, context):
        return Task(
            description='Analyze each information piece and ensure it is accurately described and relevant for students when they learn about this scientific paper',
            agent=agent,
            async_execution=True,
            context=context,
            expected_output="""A markdown-formatted presentation for each information piece.\n\n'
            """
        )

    def compile_newsletter_task(self, agent, context, callback_function):
        return Task(
            description='Compile the information pieces',
            agent=agent,
            context=context,
            expected_output="""A complete study summary in markdown format, with a consistent style and layout.
                Example Output: 
                '# Summary of the paper of Author X:\\n\\n
                Summary what the summary will be about.\\n
                ## Key concepts of the paper\\n\\n
                **Concept title 1:** Explanation or summary of the concept 1\\n\\n
                **Concept title 2:** Explanation or summary of the concept 2\\n\\n
                -...\\n\\n

                ## Concept X\\n\\n
                **Explanation:** Explanation of the concept X\\n\\n
                **Why it matters::**...\\n\\n
                **The details:**...\\n\\n
                ... additional information\\n\\n
                **Example:** Example of the concept X\\n\\n
                
                ## Concept Y\\n\\n
                ... same as above
            """,
            callback=callback_function
        )

Here is a polished version of your README for Rimori:

---

# Rimori

Rimori is an AI-powered study support tool designed to help students master their study material in a more interactive and engaging way. By combining storytelling with AI-driven interactions, Rimori offers a unique learning experience that promotes critical thinking, deep understanding, and the ability to apply knowledge across different fields.

### Key Features:
- **Interactive Storytelling**: Based on the study material, students shape the story by deciding how it should continue and explaining why their chosen path makes sense. This helps reinforce their understanding and decision-making skills.
- **AI Opponents**: Students engage with AI personas, each simulating different perspectives (child, old man, visionary). The goal is to demonstrate subject mastery by simplifying complex concepts, explaining them clearly, and applying them in various contexts.

---

## Setup

To run Rimori, the following dependencies are required: Loki, Matomo, and Supabase.

1. Set the necessary environment variables for the PDF converter and Rimori in the `.env` file.
2. Build the Rimori application with the following command:
   ```bash
   docker build -t registry.rimori.se/study/rimori:0.3.0 .
   ```
3. Navigate to the PDF converter and build it:
   ```bash
   docker build -t registry.rimori.se/study/rimori-pdf-converter:0.3.0 .
   ```
4. Start both applications using Docker Compose:
   ```bash
   docker compose up -d
   ```
5. Open your browser and navigate to `localhost:3000` to start using Rimori.

---

## Future Features

Rimori has exciting plans for future improvements and features, including:

### Storytelling Enhancements:
- **Make it Audible**: Incorporate speech-to-text (STT) and text-to-speech (TTS) to provide audio interaction.
- **Add Animations**: Bring the stories to life with dynamic visuals.

### Study Tools:
- **Study Plan Creation**: Automatically generate study plans tailored to students’ needs.
- **Flashcards**: Offer flashcards as a quick revision tool based on the material studied.
- **Plugin System**: Allow users to customize Rimori with plugins for different study aids.
- **Study Type Estimation**: Suggest personalized study strategies based on the user’s learning style.

### AI-Driven Study Assistant 2.0:
- **AI Document Awareness**: Enable the assistant to understand and summarize documents on demand.
- **Text Highlighting**: Highlight text to get instant summaries or explanations.
- **Flashcard Creation**: Create flashcards based on selected text or learning sessions.
- **Pomodoro Integration**: After each session, ask the student what they learned and automatically generate flashcards from the response.
- **PDF to Markdown Conversion**: Convert PDFs to Markdown with images and store metadata in the image tags.
- **Web Integration**: Let the assistant access the internet to find helpful resources like websites and videos.
- **File-Based Study Sessions**: Support sessions focused on reviewing different types of files.
- **Scientific Paper Summaries**: Automatically generate summaries for academic papers.

### Editor Improvements:
- **Markdown Editor**: Implement a more intuitive Markdown editor with features like the one showcased in [Remirror](https://remirror.io/docs/showcase/markdown/).

---

Rimori is constantly evolving to provide a better learning experience for students. Stay tuned for more updates and new features!

---


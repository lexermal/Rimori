# Rimori

## Docker setup
The environment variables need to be set in .env

```bash
docker build -t registry.weixler.me/rimori:0.1.0 .
docker compose up -d
```

## Todo

* Audio recording works well at beginning but is cut off when I say a second sentence after a pause.
* Stories improvements
  * Make it audible (STT, TTS)
  * Add animations

## Possible future features

* Studyplan creation
* Flashcards
* Plugin system
* Study type estimation
* Opposition Summary: After the oppositions are done the user should be able to see a summary of the oppositions and the feedback they got.
* Study assisten 2.0
  * AI document awareness
  * Highlighting text and immeadiately get a summary of the text/explanation
  * Click on text in assistent to copy it
  * Create flashcard option
  * After pomodoro session the user gets asked what they learned and the AI will create a flashcard for them
  * PDF to MD conversion with images being included and their information being stored in the image tag
  * AI assistent accessing the internet for finding useful websites/videos
  * Selection of other files study session
  * Automatic scientific paper summary creation
* Implement markdown editor how it should be https://remirror.io/docs/showcase/markdown/ 
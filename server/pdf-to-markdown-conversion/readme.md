# PDF2Markdown converter
This application converts PDF files to Markdown using AI. It then uploads the files to Appwrite.

## Installation

````bash
apt install pdftohtml
npm run dev
```

## Docker setup
The environment variables need to be set in .env

```bash
docker build -t registry.rimori.se/study/rimori-pdf-converter:0.3.0 .
docker push registry.rimori.se/study/rimori-pdf-converter:0.3.0
docker compose up -d
```

## Example bash request

```bash
curl -X POST http://localhost:3000/upload \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGx1LnNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.KMSirgeHYQiK6L2V3AmpNoeThfeFGxAoQ6Vxj7nyv7Q" \
     -F "file=@./test.pdf"
```

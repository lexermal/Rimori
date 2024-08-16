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
docker build -t rimori-pdf-converter:0.1.0 .
docker compose up -d
```

## Example bash request

```bash
curl -X POST http://localhost:3000/upload \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGx1LnNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.KMSirgeHYQiK6L2V3AmpNoeThfeFGxAoQ6Vxj7nyv7Q" \
     -F "file=@./test.pdf"
```

## .env parameters
OPENAI_API_KEY
APPWRITE_PROJECT_ID
APPWRITE_SECRET_KEY
APPWRITE_DATABASE_ID
APPWRITE_DOCUMENT_COLLECTION_ID
APPWRITE_DOCUMENT_BUCKET_ID
ASSET_PATH=.
JWT_SECRET=Pz807BnQgBjty1FrZ8EXO7JktoytchDFuU8hLcMlB9EDJI9lBSIuQhL
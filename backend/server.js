import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

app.post("/chat", async (req, res) => {
  const question = req.body.question;

  const qEmbed = await cohere.embed({
    model: "embed-english-v3.0",
    texts: [question],
  });

  const results = await qdrant.search(process.env.COLLECTION, {
    vector: qEmbed.embeddings[0],
    limit: 5,
  });

  const context = results.map(r => r.payload.text).join("\n\n");

  const answer = await cohere.generate({
    model: "command-r-plus",
    prompt: `Answer using context:\n${context}\n\nQuestion: ${question}`,
  });

  res.json({ answer: answer.generations[0].text });
});

app.listen(5000, () => console.log("Chatbot API running on port 5000"));

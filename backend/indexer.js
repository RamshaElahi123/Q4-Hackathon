import { CohereClient } from "cohere-ai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import { scrapeDocs } from "./scrape.js";

dotenv.config();

const cohere = new CohereClient({ apiKey: process.env.COHERE_API_KEY });
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function createCollection() {
  try {
    await qdrant.createCollection(process.env.COLLECTION, {
      vectors: { size: 1024, distance: "Cosine" },
    });
  } catch (e) {
    console.log("Collection exists.");
  }
}

export async function indexDocs() {
  await createCollection();

  const docs = scrapeDocs();
  console.log("Scraped docs:", docs.length);

  for (const doc of docs) {
    const embed = await cohere.embed({
      model: "embed-english-v3.0",
      texts: [doc.text],
    });

    await qdrant.upsert(process.env.COLLECTION, {
      points: [
        {
          id: doc.id,
          vector: embed.embeddings[0],
          payload: { text: doc.text, file: doc.id },
        },
      ],
    });

    console.log("Indexed:", doc.id);
  }
}

indexDocs();

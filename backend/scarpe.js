import fs from "fs";
import path from "path";

const docsPath = path.join(process.cwd(), "../docs");

export function scrapeDocs() {
  const files = fs.readdirSync(docsPath);
  const docs = [];

  for (const file of files) {
    if (file.endsWith(".md") || file.endsWith(".mdx")) {
      const content = fs.readFileSync(path.join(docsPath, file), "utf-8");
      docs.push({ id: file, text: content });
    }
  }

  return docs;
}

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ReelScript {
  title: string;
  script: string;
}

export async function chunkDocsIntoReels(
  docsText: string,
): Promise<ReelScript[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a developer who just read this documentation and is explaining it to a friend who asked "what's the important shit I need to know?"

No hype. No salesmanship. No "revolutionize your workflow." Just the actual useful stuff, explained like a human being talking to another human being. Slightly impatient, direct, like you're saving them from reading the whole thing themselves.

Pick the 5 most important things from these docs. Not generic — specific to what's actually in here.

Bad title: "Key Features"
Good title: "You never write a CSS file again"

Bad title: "Introduction"
Good title: "Why everyone switched to this"

Rules:
- 5 reels
- Titles: blunt, specific, 4-6 words
- Scripts: 100-130 words, casual spoken language, zero corporate speak, plain text only
- Talk like a person, not a blog post
- You can use a quick analogy, a light reaction ("which is wild"), or a gotcha moment to keep it interesting — but don't overdo it
- Each reel stands alone

Return ONLY a JSON array, no other text:
[{"title": "...", "script": "..."}]

Documentation:
${docsText.slice(0, 8000)}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text")
    throw new Error("Unexpected response type from Claude");

  try {
    return JSON.parse(content.text) as ReelScript[];
  } catch {
    // Try extracting JSON if Claude added any surrounding text
    const match = content.text.match(/\[[\s\S]*\]/);
    if (!match)
      throw new Error("Could not parse reel scripts from Claude response");
    return JSON.parse(match[0]) as ReelScript[];
  }
}

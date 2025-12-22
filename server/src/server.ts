import { z } from "zod";
import { McpServer } from "skybridge/server";
import OpenAI from "openai";
import { env } from "./env.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function generateHtmlFromPrompt(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an HTML generator. Generate self-contained HTML with inline styles based on the user's prompt. 
Do NOT include any markdown formatting, code fences, or backticks.
Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags.
Only output the HTML content that would go inside a <div>.
Use modern, clean inline styles. Make the UI visually appealing with good typography and spacing.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "<p>Failed to generate content</p>";
}

const server = new McpServer(
  {
    name: "generative-ui-app",
    version: "0.0.1",
  },
  { capabilities: {} },
).registerWidget(
  "generative-ui",
  {
    description: "Generative UI widget that renders HTML content",
  },
  {
    description:
      "Use this tool to generate and display custom HTML UI based on a prompt. The prompt should describe what visual content to display.",
    inputSchema: {
      prompt: z.string().describe("A description of the UI/content to generate"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async ({ prompt }) => {
    try {
      const html = await generateHtmlFromPrompt(prompt);

      return {
        _meta: { html },
        content: [
          {
            type: "text",
            text: "The Generative UI HTML content has been generated",
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    }
  },
);

export default server;
export type AppType = typeof server;

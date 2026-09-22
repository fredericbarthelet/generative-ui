import { anthropic } from "@ai-sdk/anthropic";
import { start } from "@skybridge/test";
import { expect, it } from "vitest";
import { app } from "../src/server.js";

it("reaches the generative UI tool from a natural prompt", async () => {
  const chat = await start({ app, model: anthropic("claude-sonnet-4-5") });
  await chat.send("Show me a pricing table for a SaaS product with three tiers");

  expect.chat(chat).toHaveCalledToolOnce("generative-ui");
});

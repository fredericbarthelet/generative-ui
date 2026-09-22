# Generative UI

## Value Proposition

Turn any request for a visual into a rendered piece of UI inside the conversation, instead of a
wall of text or a code block the user has to copy somewhere to see. Target: anyone exploring an
idea with an assistant who wants to *look* at it — a pricing card, a comparison, a small layout.

**Core action**: Describe the UI you want, see it rendered.

## Why LLM?

**Conversational win**: "Show me a pricing card for a Pro plan at $29/month" is one sentence
versus opening a design tool or writing markup by hand.

**LLM adds**: Turns an informal description into concrete HTML, and picks the layout, wording,
and styling details the user did not specify.

**What LLM lacks**: A surface to render the markup. The assistant can emit HTML but cannot
display it; the view supplies that.

## UI Overview

**First view**: A spinner while the HTML is being generated.

**Result**: The generated HTML rendered in a sandboxed iframe that auto-sizes to its content, so
short output stays compact and long output is fully visible without inner scrolling.

**End state**: The rendered UI stays in the conversation; asking for a change re-runs the tool and
produces a new render.

## Product Context

- **Tool**: `generative-ui` — input `prompt` (string), renders the `generative-ui` view.
- **Generation**: OpenAI `gpt-4o-mini` via the `openai` SDK, prompted to return self-contained
  HTML with inline styles and no markdown fences, doctype, or `<html>`/`<head>`/`<body>` wrapper.
- **Data flow**: The HTML is returned in `_meta.html`, not `structuredContent` — the markup is a
  display-only payload that would otherwise flood the model's context. `content` carries a short
  confirmation for the model.
- **Rendering**: The view injects a height-reporting script into the HTML, renders it via iframe
  `srcDoc` with `sandbox="allow-scripts"`, and sizes the iframe from the `postMessage` height the
  script reports (minimum 50px, 200px before the first report).
- **Auth**: None. `OPENAI_API_KEY` is a server-side environment variable, read via `src/env.ts` and
  validated at startup.
- **Constraints**: Generated markup is untrusted, so it is isolated in a sandboxed iframe with no
  same-origin access.

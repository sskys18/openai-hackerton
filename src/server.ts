#!/usr/bin/env bun
// Culprit MCP server. Speaks MCP over stdio so Codex can bind its tools.
// Deterministic tools work today; GPT-5.6 reasoning tools need OPENAI_API_KEY.

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

import { tools } from "./tools/index.ts";

const server = new Server(
  { name: "culprit", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.input, { target: "openApi3" }),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) throw new Error(`unknown tool: ${req.params.name}`);
  const args = tool.input.parse(req.params.arguments ?? {});
  const result = await tool.handler(args);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("culprit MCP server ready on stdio");
}

main().catch((err) => {
  console.error("culprit fatal:", err);
  process.exit(1);
});

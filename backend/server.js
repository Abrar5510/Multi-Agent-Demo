import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(express.json());

const CORAL = process.env.CORAL_URL || "http://localhost:5555";

// Load registry.toml (simple parse by lines)
function getAgents() {
  const lines = fs.readFileSync("../registry.toml", "utf8").split("\n");
  return lines
    .filter((l) => l.startsWith("id"))
    .map((l) => l.split("=")[1].trim().replace(/"/g, ""));
}

// List all agents
app.get("/agents", (req, res) => {
  res.json(getAgents());
});

// Create session with chosen agents
app.post("/session", async (req, res) => {
  const body = {
    name: "dynamic-session",
    agents: req.body.agents || []
  };
  const r = await fetch(`${CORAL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  res.json(await r.json());
});

// Post a message
app.post("/sessions/:sessionId/messages", async (req, res) => {
  const { sessionId } = req.params;
  const payload = { role: "user", content: req.body.content };
  const r = await fetch(`${CORAL}/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  res.json(await r.json());
});

app.listen(4000, () => console.log("Backend running on port 4000"));

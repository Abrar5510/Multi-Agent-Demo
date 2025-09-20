import { useEffect, useState } from "react";
import { CrossmintPayButton } from "@crossmint/client-sdk-react";

export default function App() {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/agents")
      .then((res) => res.json())
      .then(setAgents);
  }, []);

  async function createSession() {
    const res = await fetch("http://localhost:4000/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agents: selected }),
    });
    const data = await res.json();
    setSessionId(data.id);
  }

  async function sendMessage() {
    if (!sessionId) return;
    const res = await fetch(`http://localhost:4000/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    const data = await res.json();
    setMessages([...messages, { role: "user", content: input }, data]);
    setInput("");
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🚀 Coral AI Business Hub</h1>

      {!sessionId && (
        <div className="mb-6">
          <h2 className="text-xl mb-2">Select Agents</h2>
          <div className="grid grid-cols-2 gap-2">
            {agents.map((a) => (
              <label key={a} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={a}
                  onChange={(e) => {
                    if (e.target.checked) setSelected([...selected, a]);
                    else setSelected(selected.filter((id) => id !== a));
                  }}
                />
                <span>{a}</span>
              </label>
            ))}
          </div>
          <button
            onClick={createSession}
            className="mt-4 px-4 py-2 bg-blue-500 rounded"
          >
            Start Session
          </button>
          <div className="mt-6">
            <CrossmintPayButton
              clientId="YOUR_CROSSMINT_CLIENT_ID"
              environment="staging"
              mintConfig={{ type: "erc-721", quantity: "1" }}
            />
          </div>
        </div>
      )}

      {sessionId && (
        <div>
          <div className="flex space-x-2 mb-4">
            <input
              className="flex-1 p-2 rounded text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-green-500 rounded"
            >
              Send
            </button>
          </div>
          <div className="space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded ${
                  m.role === "user" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                <b>{m.role}:</b> {m.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import useSSE from "@/hooks/use-sse"; // Adjust the import path as necessary
const SSEComponent = () => {
  const { isConnected, messages, error } = useSSE("/api/notifications");

  return (
    <div>
      <h1>SSE Connection</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Messages:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
};

export default SSEComponent;
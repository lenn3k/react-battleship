import React from "react";
import "./console.css";

interface ConsoleProps {
  messages: string[];
}

const Console = (props: ConsoleProps) => {
  const { messages } = props;
  return (
    <div className="console">
      <div className="console-output">
        {messages.map((message) => (
          <div>&gt; {message}</div>
        ))}
      </div>
    </div>
  );
};

export default Console;

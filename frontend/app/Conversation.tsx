"use client";

import React, { useState, useRef } from "react";
import useSWR from "swr";

type Content = {
  text: string;
  links?: Array<string>;
};

type Message = {
  user: string;
  content?: Content;
  lastMessage?: string;
};

type MessageProps = {
  message: Message;
  onNewContent: (content: Content) => void;
};

async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

type BotResponse = {
  messages: Array<BotMessage>;
};

type BotMessage = {
  message: string;
  source: string;
  links?: Array<string>;
};

type APIMessage = {
  source: string;
  text: string;
  links: Array<string>;
};

function LoadBotChat({ message, onNewContent }: MessageProps) {
  const { data, isLoading, error } = useSWR(
    `/api/bot?query=${message.lastMessage}`,
    fetcher
  );
  if (error) {
    console.log(error);
    // onNewContent({
    //   text: "Whoops! There was a problem talking to PyTorch Assistant...",
    // });
  }
  if (data) {
    console.log("data");
    const apiData: APIMessage = data as APIMessage;
    onNewContent({
      text: apiData.source + apiData.text,
      links: apiData.links,
    });
  }
  return <h3>PyTorch Assistant: ...</h3>;
}
function UserInputChat({ message, onNewContent }: MessageProps) {
  const query = useRef<HTMLInputElement>(null);
  const leaveEntry = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    console.log(query);
    console.log(query.current?.value);
    const queryText = query.current?.value as string;
    if (queryText == "") {
      return;
    }
    onNewContent({ text: queryText });
  };
  return (
    <>
      <h3>You:</h3>
      <form onSubmit={leaveEntry}>
        <input
          ref={query}
          aria-label="Your message"
          placeholder="Your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
function StaticChat({ user, content }: Message) {
  return (
    <h3>
      {user}: {content?.text}
    </h3>
  );
}

function Chat({ message, onNewContent }: MessageProps) {
  if (message.user == "bot") {
    return <LoadBotChat message={message} onNewContent={onNewContent} />;
  }
  if (message.user == "me") {
    return <UserInputChat message={message} onNewContent={onNewContent} />;
  }
  return <StaticChat user={message.user} content={message.content} />;
}

export default function Conversation() {
  const [messages, setMessages] = useState([{ user: "me" }]);
  // console.log(messages);

  const handleNewContent = (content: Content) => {
    let updatedMessages = messages.slice();
    let currentMessage: Message = updatedMessages[updatedMessages.length - 1];

    // Set current message content
    currentMessage.content = content;

    // Create new message for response
    let nextUser: string;
    if (currentMessage.user == "me") {
      nextUser = "bot";
    } else {
      nextUser = "me";
    }
    const nextMessage: Message = { user: nextUser };
    if (nextUser == "bot") {
      nextMessage.lastMessage = content.text;
    }
    // console.log("update");
    console.log([...updatedMessages, nextMessage]);
    setMessages([...updatedMessages, nextMessage]);
  };

  return (
    <>
      {messages.map((message, index) => {
        return (
          <Chat key={index} message={message} onNewContent={handleNewContent} />
        );
      })}
    </>
  );
}

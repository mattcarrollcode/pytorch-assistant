"use client";

import React, { useState, useRef, useEffect } from "react";
import internal from "stream";
import useSWR from "swr";

async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

type Message = {
  id?: number;
  user: string;
  text: string;
  prev?: string;
};

type BotMessage = {
  source: string;
  message: string;
  links: Array<string>;
};

type ChatProps = {
  message: Message;
  onMessageUpdate: (message: Message) => void;
};

function Chat({ message, onMessageUpdate }: ChatProps) {
  // Go get the reply from the bot
  if (message.prev) {
    console.log(message.prev);
    const { data, error } = useSWR<BotMessage>(
      `/api/bot?query=${message.prev}`,
      fetcher
    );
    if (data) {
      console.log(data);
      message.text = data.message;
      // onMessageUpdate(message);
    }
    if (error) {
      message.text = "Whoops!";
      // onMessageUpdate(message);
    }
  }
  return (
    <h3>
      {message.user}: {message.text}
    </h3>
  );
}

type UserInputProps = {
  onMessageUpdate: (message: Message) => void;
};

function UserInput({ onMessageUpdate }: UserInputProps) {
  const query = useRef<HTMLInputElement>(null);
  const leaveEntry = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    const text = query.current?.value as string;
    if (text == "") {
      return;
    }
    const newMessage = { user: "me", text: text };
    onMessageUpdate(newMessage);
  };
  return (
    <>
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

export default function Conversation() {
  const [messages, setMessages] = useState<Array<Message>>([]);

  const handleMessageUpdate = (message: Message) => {
    if (!message.id) {
      const newMessages = messages.slice();
      const newUserChat = message;
      newUserChat.id = messages.length;
      const botReplyChat: Message = {
        user: "bot",
        text: "...",
        prev: message.text,
        id: messages.length + 1,
      };
      setMessages([...newMessages, newUserChat, botReplyChat]);
    } else {
      let newMessages = messages.slice();
      newMessages[message.id] = message;
      setMessages(newMessages);
    }
  };

  return (
    <>
      {messages.map((message, index) => {
        return (
          <Chat
            key={index}
            message={message}
            onMessageUpdate={(message: Message) => {
              handleMessageUpdate(message);
            }}
          />
        );
      })}

      <UserInput
        onMessageUpdate={(message) => {
          handleMessageUpdate(message);
        }}
      />
    </>
  );
}

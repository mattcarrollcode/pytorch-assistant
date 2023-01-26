import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"] });

async function getData() {
  // curl -d '{"query":"test"}' -H "Content-Type: application/json" -X POST http://127.0.0.1:5000/query
  const res = await fetch("http://127.0.0.1:5000/query", {
    method: "POST",
    body: JSON.stringify({
      query: "How do I make my experiment deterministic?",
    }),
    headers: { "Content-Type": "application/json" },
    // cache: "no-cache",
  });
  // console.log(res);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    console.log("res");
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

type Message = {
  source: string;
  message: string;
};

export default async function Page() {
  const data = await getData();

  let messages = data.messages as Array<Message>;

  return (
    <div>
      <h2>Who are you? I am you.</h2>
      {messages.map((message, index) => {
        return (
          <div>
            <h1>{message.source}</h1>
            <p>{message.message}</p>
          </div>
        );
      })}
    </div>
  );
}

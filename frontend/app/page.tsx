import { Inter } from "@next/font/google";
import Conversation from "./Conversation";

export default async function Page() {
  return (
    <div>
      <h2>PyTorch Assistant</h2>
      <Conversation />
    </div>
  );
}

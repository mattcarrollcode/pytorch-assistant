import { NextApiRequest, NextApiResponse } from "next";

type Message = {
  source: string;
  text: string;
  links: Array<string>;
};

export default async function personHandler(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {
  const backendRes = await fetch(
    `http://127.0.0.1:5000/?query=${req.query.query}`
  );
  const json = await backendRes.json();
  const firstMessage: Message = json.messages[0] as Message;

  // User with id exists
  return backendRes ? res.status(200).json(firstMessage) : res.status(404);
}

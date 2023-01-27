import { NextApiRequest, NextApiResponse } from "next";

type BotMessage = {
  source: string;
  message: string;
  links: Array<string>;
};

export default async function personHandler(
  req: NextApiRequest,
  res: NextApiResponse<BotMessage>
) {
  console.log(req.query.query);
  const backendRes = await fetch(
    `http://127.0.0.1:5000/?query=${req.query.query}`
  );
  const json = await backendRes.json();
  const firstMessage: BotMessage = json.messages[1] as BotMessage;

  // User with id exists
  return backendRes ? res.status(200).json(firstMessage) : res.status(404);
}

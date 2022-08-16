import { NextApiRequest, NextApiResponse } from "next";
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.NEXT_PUBLIC_KEY,
  secret: process.env.SECRET,
  cluster: process.env.NEXT_PUBLIC_CLUSTER,
  useTLS: true,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, text, user, userColor } = req.body;
  if (req.body.type === "connect" || req.body.type === "disconnect") {
    const pusherResponse = await pusher.trigger("chat", "chat-event", { type, user, userColor });
  } else {
    const pusherResponse = await pusher.trigger("chat", "chat-event", { type, text, user, userColor });
  }
  res.json("Code executed");
};

export default handler;

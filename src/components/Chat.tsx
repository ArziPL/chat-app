import axios from "axios";
import Pusher from "pusher-js";
import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type TChat = {
  username: string;
  userColor: string;
};

type TMessage = {
  type: string;
  text?: string;
  user: string;
  userColor: string;
};

type TMessageComponentProps = {
  message: TMessage;
  contrast: boolean;
};

const Chat = ({ username, userColor }: TChat) => {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [contrast, setContrast] = useState(false);
  const messagesListRef = useRef<HTMLUListElement>(null);

  // Send message that user joined
  const sendJoin = async () => {
    await axios.post("/api/pusher", { type: "connect", user: username, userColor: userColor });
  };

  // Send message that user left
  const sendLeft = async () => {
    await axios.post("/api/pusher", { type: "disconnect", user: username, userColor: userColor });
  };

  // Logic to send message
  const sendMessage = async () => {
    if (userMessage !== "") {
      await axios.post("/api/pusher", { type: "message", text: userMessage, user: username, userColor: userColor });
      setUserMessage("");
    }
  };

  // Trigger send function on button send click
  const handleSendButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    sendMessage();
  };

  // Trigger send function on enter key while focused on input
  const handleSendKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  // Scroll messages list to last element (last message that came from Pusher)
  const scrollIntoViewOnNewMessage = () => {
    let lastElement = messagesListRef.current!.lastElementChild;
    lastElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  // Whole app logic
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY, {
      cluster: process.env.NEXT_PUBLIC_CLUSTER,
      forceTLS: true,
    });
    const channel = pusher.subscribe("chat");
    channel.bind("chat-event", (data: any) => {
      // Flush sync to make sure scroll into view will scroll to last message
      flushSync(() => {
        if (data.type === "connect" || data.type === "disconnect") {
          setMessages((prevState) => [...prevState, { type: data.type, user: data.user, userColor: data.userColor }]);
        } else {
          setMessages((prevState) => [
            ...prevState,
            { type: data.type, text: data.text, user: data.user, userColor: data.userColor },
          ]);
        }
      });
      // If user will scroll a little bit top then scroll into view won't trigger (user can read old messages without constant automatic scrolling to new one)
      if (messagesListRef.current!.scrollHeight - messagesListRef.current!.scrollTop < 600) {
        scrollIntoViewOnNewMessage();
      }
    });

    // Send join on first load and send left on closing tab
    sendJoin();
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      sendLeft();
    });

    return () => {
      pusher.unsubscribe("chat");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="border-gradient w-[600px] h-[600px] bg-black shadow flex flex-col md:w-screen md:h-screen">
      <ul className="w-full h-full p-2 overflow-y-auto" ref={messagesListRef}>
        {messages.length > 0 ? (
          messages.map((message, indx) => <TextMessage key={indx} message={message} contrast={contrast} />)
        ) : (
          <div></div>
        )}
      </ul>
      <hr className="w-[95%] m-auto" />
      <div className="w-full h-[50px] flex">
        <input
          value={userMessage}
          onChange={(e) => {
            setUserMessage(e.target.value);
          }}
          onKeyDown={handleSendKeyPress}
          className="w-[75%] h-[50px] p-4 text-white bg-black focus:outline-none"
          type="text"
          placeholder="Type your message..."
        />
        <button
          className="w-[10%] h-[50px] bg-black text-gray-500 active:scale-[0.95] hover:text-white focus:outline-none md:text-sm"
          onClick={handleSendButtonClick}
        >
          Send
        </button>
        <button
          className="w-[15%] h-[50px] bg-black text-gray-500 active:scale-[0.95] hover:text-white focus:outline-none md:text-sm"
          onClick={() => setContrast(!contrast)}
        >
          Contrast
        </button>
      </div>
    </div>
  );
};

export default Chat;

const TextMessage = (props: TMessageComponentProps) => {
  const { message, contrast } = props;
  if (message.type == "disconnect" || message.type == "connect") {
    return (
      <li className="text-gray-500 list-none font-bold">
        User <span style={{ color: contrast ? "white" : message.userColor }}>{message.user}</span> just{" "}
        {message.type == "connect" ? "joined!" : "left!"}
      </li>
    );
  } else {
    return (
      <li className="text-white list-none">
        <span style={{ color: contrast ? "white" : message.userColor }}>
          <b>{message.user}: </b>
        </span>
        {message.text}
      </li>
    );
  }
};

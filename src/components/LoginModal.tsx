import { Dispatch, SetStateAction } from "react";

type LoginModal = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  userColor: string;
  setUserColor: Dispatch<SetStateAction<string>>;
  setInTheChat: Dispatch<SetStateAction<boolean>>;
};

const LoginModal = ({ username, setUsername, userColor, setUserColor, setInTheChat }: LoginModal) => {
  return (
    <>
      <div className="border-gradient w-[400px] h-[270px] bg-black flex flex-col justify-center items-center gap-3 shadow md:scale-[0.85]">
        <div className="text-white text-2xl w-[350px]">next-chat-app</div>
        <input
          className="w-[350px] h-[40px] text-white bg-gray-800 shadow rounded pl-2 border-[2px] border-solid border-gray-800 focus:outline-none focus:border-purple-800"
          placeholder="Enter username..."
          type="text"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          value={username}
        />
        <div className="w-[350px] flex items-center gap-5 text-xl">
          <input
            className="w-[50px] h-[50px] text-white shadow rounded p-1 bg-gray-800 border-[2px] border-solid border-gray-800 focus:outline-none focus:border-purple-800"
            type="color"
            onChange={(e) => {
              setUserColor(e.target.value);
            }}
            value={userColor}
          />
          <div style={{ color: userColor }} className="font-semibold">
            Your displayed color
          </div>
        </div>
        <input
          disabled={username === "" ? true : false}
          type="submit"
          className={`w-[350px] h-[40px] mb-2 rounded shadow bg-gray-800 text-white focus:outline-none ${
            username === "" ? "" : "cursor-pointer hover:bg-white hover:text-black active:scale-[0.95]"
          }`}
          value={username === "" ? "First enter nick!" : "Start chatting!"}
          onClick={(e) => {
            setInTheChat(true);
          }}
        />
      </div>
    </>
  );
};

export default LoginModal;

import axios from "axios";
import Chats from "./Chatclient";
import { ReactElement } from "react";

async function getChats(roomId: string) {
    try {
        const res = await axios.get(`${process.env. NEXT_PUBLIC_URL_HTTP_URL}/message/${roomId}`);
        return res.data.message;
    } catch (err) {
        console.error('Failed to fetch messages:', err);
        return { messages: [] };
    }
}

const ChatRoom = async ({ roomId }: { roomId: string }): Promise<ReactElement> => {
    const data = await getChats(roomId);
    return (
        <Chats messages={data || []} roomId={roomId} />
    )
}
export default ChatRoom
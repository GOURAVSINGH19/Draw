
"use client";

import { ReactElement, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Image, Paperclip, Send } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
const Chats = ({
    messages,
    roomId,
}: {
    messages: { message: string }[];
    roomId: string,
}): ReactElement => {
    const [chats, setChats] = useState(messages);
    const [currentMessage, setCurrentMessage] = useState("");
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (socket && !loading) {

            socket.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, { message: parsedData.message }])
                }
            }
        }
    }, [socket, loading, roomId])
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
            <Card className="w-full max-w-md h-[600px] flex flex-col border-[#1e1e1e] bg-[#1e1e1e] shadow-lg rounded-sm">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-center mt-4">Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chats.map((msg, id) => (
                            <div key={id} className={`flex "justify-end" }`}>
                                <div
                                    className={`max-w-[80%]  text-white "
                                        }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 p-4 border-t flex ">
                        <Input
                            type="text"
                            placeholder="Type your message..."
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            className="flex-1 border-none outline-0"
                        />
                        <Button onClick={() => {
                            socket?.send(JSON.stringify({
                                type: "chat",
                                roomId: roomId,
                                message: currentMessage
                            }))
                            setCurrentMessage("");
                        }}
                            size="icon" disabled={!currentMessage.trim()}>
                            <Send className="h-4 w-4 cursor-pointer" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

}

export default Chats
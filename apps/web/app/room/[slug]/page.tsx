import { ReactElement } from "react";
import ChatRoom from "../../../components/ChatRoom";
import axios from "axios";

async function getRoomId(slug: string) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_HTTP_URL}/room/${slug}`)
    const id = response.data.room.id;
    return id;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }): Promise<ReactElement> {
    const { slug } = await params;
    const roomId = await getRoomId(slug);
    return <ChatRoom roomId={roomId} />;
}
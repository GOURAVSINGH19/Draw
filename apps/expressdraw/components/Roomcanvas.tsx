"use client"
import React, { useEffect, useState } from 'react'
import Canva from "./Canvas"
const RoomCanvas = ({ roomId }: { roomId: string }) => {
    const [socket, setSocket] = useState<WebSocket>();
   const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYjI2MWM1Mi0xNmU4LTQ0NTMtOTQ0Yi04OTRkYzUzNDY5MWMiLCJpYXQiOjE3NTQyMTUyODAsImV4cCI6MTc1NDMwMTY4MH0.BgbpkboQcbcj8cKg2Xm1BOpUPDj5vbogkxYM5Ec9ktc";
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8001?token=${token}`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            })
            ws.send(data);
        }
    }, [])

    if (!socket) return <div>Connection to ws....</div>
    return (
        <Canva roomId={roomId} socket={socket} />
    )
}

export default RoomCanvas
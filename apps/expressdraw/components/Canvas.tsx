"use client"
import { useEffect, useRef, useState } from "react"
import { Draw } from "../draw/Logic";

export type Tool = "rect" | "circle" | "pencil" | "line" | "move"

const Canva = ({ roomId, socket }: {
    socket: WebSocket,
    roomId: string
}) => {
    const canvaref = useRef<HTMLCanvasElement>(null);
    const [canva, setcanva] = useState<Draw>();
    const [selectedTool, setSelectedTool] = useState<Tool>("rect")
    useEffect(() => {
        canva?.setTool(selectedTool);
    }, [selectedTool, canva]);

    useEffect(() => {
        if (canvaref.current) {
            const g = new Draw(canvaref.current, roomId, socket);
            setcanva(g);
            return () => {
                g.destroy();
            }
        }
    }, [canvaref])
    return (
        <div className="overflow-hidden h-full">
            <canvas ref={canvaref} width={window.innerWidth} height={window.innerHeight}></canvas>
            <Topbar setSelectedTool={setSelectedTool} />
        </div>
    )
}


export function Topbar({ setSelectedTool }: {
    setSelectedTool: (s: Tool) => void
}) {
    return (
        <div className="w-fit h-fit flex gap-10 fixed z-[10000] top-[2rem] left-[2rem]">
            <button onClick={() => setSelectedTool("circle")} className="bg-transparent px-3 py-3  border-[2px] border-[#ffff] ">
                ⭕
            </button>
            <button onClick={() => setSelectedTool("pencil")} className="bg-transparent px-3 py-3 border-[2px] border-[#ffff] ">
                ✏️
            </button>
            <button onClick={() => setSelectedTool("rect")} className="bg-transparent px-3 py-3 border-[2px] border-[#ffff] ">
                ⏹️
            </button>
        </div>
    )
}

export default Canva
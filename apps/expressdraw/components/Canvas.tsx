"use client"
import { useEffect, useRef, useState } from "react"
import { Draw } from "../draw/Logic";
import { Circle, Eraser, EraserIcon, Move, Pencil, Square, ZoomIn } from "lucide-react";

export type Tool = "rect" | "circle" | "pencil" | "line" | "move" | "zoom";
export type Color = "red" | "black" | "white" | "pink"
const Canva = ({ roomId, socket }: {
    socket: WebSocket,
    roomId: string
}) => {
    const canvaref = useRef<HTMLCanvasElement>(null);
    const [canva, setcanva] = useState<Draw>();
    const [eraser, seteraser] = useState();
    const [selectedTool, setSelectedTool] = useState<Tool>("move")
    const [colors, setColor] = useState<Color>("white");
    const [Canvasize, setCanvasSize] = useState({ width: 0, height: 0 })
    useEffect(() => {
        canva?.setTool(selectedTool);
        canva?.setColorTool(colors)
    }, [selectedTool, colors, canva]);
    const updateCanvasSize = (): any => {
        setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };

    useEffect(() => {
        if (canvaref.current) {
            const g = new Draw(canvaref.current, roomId, socket);
            setcanva(g);
            return () => {
                g.destroy();
            };
        }
    }, [canvaref]);

    useEffect(() => {
        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
        return () => window.removeEventListener("resize", updateCanvasSize);
    }, [])

    return (
        <div className={`overflow-hidden h-full  ${selectedTool === "move" ? "cursor-move" : "cursor-pointer"}`}>
            <canvas className="bg-[#121212]" ref={canvaref} width={Canvasize.width} height={Canvasize.height}></canvas>
            <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
            <ColorTool setColor={setColor} />
        </div>
    )
}


export function Topbar({ setSelectedTool, selectedTool }: {
    setSelectedTool: (s: Tool) => void,
    selectedTool: Tool
}) {
    return (
        <div className="w-fit h-fit flex gap-5 fixed z-[10000] bottom-[2rem] left-[20%] md:left-[40%] bg-white p-1 rounded-md">
            <button onClick={() => setSelectedTool("circle")} className={`cursor-pointer px-2 py-1 ${selectedTool == "circle" ? "bg-purple-500" : "bg-blend-multiply"} text-white rounded-md border-[2px] border-[#ffff]`}>
                <Circle className={` w-5 h-5 ${selectedTool === "circle" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={() => setSelectedTool("line")} className={`cursor-pointer px-2 py-1 ${selectedTool == "line" ? "bg-purple-500" : "bg-blend-multiply"} text-white rounded-md border-[2px] border-[#ffff]`}>
                <Pencil className={` w-5 h-5 ${selectedTool === "line" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={() => setSelectedTool("rect")} className={`cursor-pointer px-2 py-1 ${selectedTool == "rect" ? "bg-purple-500" : "bg-blend-multiply"} text-white rounded-md border-[2px] border-[#ffff]`}>
                <Square className={`w-5 h-5 ${selectedTool === "rect" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={() => setSelectedTool("move")} className={`cursor-pointer px-2 py-1 ${selectedTool == "move" ? "bg-purple-500" : "bg-blend-multiply"} text-white rounded-md border-[2px] border-[#ffff]`}>
                <Move className={`w-5 h-5 ${selectedTool === "move" ? "text-white" : "text-black"}`} />
            </button>
            <button onClick={() => setSelectedTool("zoom")} className={`cursor-pointer px-2 py-1 ${selectedTool == "zoom" ? "bg-purple-500" : "bg-blend-multiply"} text-white rounded-md border-[2px] border-[#ffff]`}>
                <ZoomIn className={`w-5 h-5 ${selectedTool === "zoom" ? "text-white" : "text-black"}`} />
            </button>
        </div>
    )
}

export function ColorTool({ setColor }: { setColor: (s: Color) => void }) {
    return (
        <div className="w-fit h-fit flex items-center flex-col absolute top-[40%] left-[2%] bg-[#ffffff38] px-2 py-1 gap-2 rounded-md">
            <button onClick={() => setColor("pink")} className={`cursor-pointer px-2 py-1  text-white rounded-md`}>
                <Circle className="w-5 h-5 " fill="pink" />
            </button>
            <button onClick={() => setColor("white")} className={`cursor-pointer px-2 py-1  text-white rounded-md`}>
                <Circle className="w-5 h-5 " fill="white" />
            </button>
            <button onClick={() => setColor("black")} className={`cursor-pointer px-2 py-1  text-white rounded-md`}>
                <Circle className="w-5 h-5 " fill="black" />
            </button>
            <button onClick={() => setColor("red")} className={`cursor-pointer px-2 py-1  text-white rounded-md`}>
                <Circle className="w-5 h-5 " fill="red" />
            </button>
        </div>
    )
}

export default Canva
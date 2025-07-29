import { Tool } from "../components/Canvas";
import { getEistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "move";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };
export class Draw {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  public offsetX = 0;
  public offsetY = 0;
  public scale = 1;
  public isDragging = false;
  private isPanning = false;
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.startX = 0;
    this.startY = 0;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.draw();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: "circle" | "pencil" | "rect" | "line" | "move") {
    this.selectedTool = tool;
  }

  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    this.drawGrid();
    this.ctx.restore();
  };

  drawGrid() {
    const step = 10;
    const rangex = this.canvas.width;
    const rangey = this.canvas.height;

    this.ctx.strokeStyle = "#121212";

    for (let x = -rangex; x <= rangex; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -rangey);
      this.ctx.lineTo(x, rangey);
      this.ctx.stroke();
    }

    for (let y = -rangey; y <= rangey; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(-rangex, y);
      this.ctx.lineTo(rangex, y);
      this.ctx.stroke();
    }
  }

  endDrag() {
    this.isDragging = false;
  }

  async init() {
    this.existingShapes = await getEistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    this.drawGrid();

    this.existingShapes.map((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "line") {
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        console.log("Drawing line:", shape);
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });

    this.ctx.restore();
  }

  getMousePos(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - this.offsetX) / this.scale;
    const y = (event.clientY - rect.top - this.offsetY) / this.scale;
    return { x, y };
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.isDragging = true;
    this.clicked = true;

    const { x, y } = this.getMousePos(e);
    this.startX = x;
    this.startY = y;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isDragging = false;
    if (this.isPanning) return;

    this.clicked = false;
    const { x: endX, y: endY } = this.getMousePos(e);
    const width = endX - this.startX;
    const height = endY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else if (selectedTool === "line") {
      shape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
      };
    }

    console.log("Shape to be added:", shape);
    if (!shape) return;
    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );

    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.isDragging) return;

    if (this.isPanning) {
      this.offsetX += e.clientX - this.startX;
      this.offsetY += e.clientY - this.startY;
      this.clearCanvas();
      return;
    }

    const { x: currentX, y: currentY } = this.getMousePos(e);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    const selectedTool = this.selectedTool;
    console.log(this.startX, this.startY, currentX, currentY);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    if (this.clicked) {
      if (selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (selectedTool === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
    this.ctx.restore();
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") this.isPanning = true;
    });
    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") this.isPanning = false;
    });
    this.canvas.addEventListener("touchend", () => this.endDrag());
    this.canvas.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        this.offsetX -= e.deltaX;
        this.offsetY -= e.deltaY;
        this.clearCanvas();
      },
      { passive: false }
    );
    // // Zoom
    // this.canvas.addEventListener("wheel", (e) => this.zoom(e), {
    //   passive: false,
    // });
  }
}

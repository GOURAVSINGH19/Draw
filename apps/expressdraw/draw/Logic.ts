import { Color, Tool } from "../components/Canvas";
import { getEistingShapes } from "./http";

type Shape =
  | ({
      id: string;
    } & (
      | {
          type: "rect";
          x: number;
          y: number;
          width: number;
          height: number;
          color: Color;
        }
      | {
          type: "circle";
          centerX: number;
          centerY: number;
          radius: number;
          color: Color;
        }
      | {
          type: "pencil";
          startX: number;
          startY: number;
          color: Color;
        }
      | {
          type: "line";
          startX: number;
          startY: number;
          endX: number;
          endY: number;
          color: Color;
        }
      | {
          type: "move";
          startX: number;
          startY: number;
          endX: number;
          endY: number;
        }
    ))

export class Draw {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private selectColorTool: Color = "white";
  public offsetX = 0;
  public offsetY = 0;
  public scale = 1;
  public isDragging = false;
  private selectedShapeIndex: number | null = null;
  private dragOffsetX: number | null = null;
  private dragOffsetY: number | null = null;
  private eraserRadius: number = 0;
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
    // this.draw();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(
    tool: "circle" | "pencil" | "rect" | "move" | "line" | "zoom" 
  ) {
    this.selectedTool = tool;
  }

  setColorTool(tool: "red" | "black" | "white" | "pink") {
    this.selectColorTool = tool;
  }

  // draw = () => {
  //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  //   this.ctx.save();
  //   this.ctx.translate(this.offsetX, this.offsetY);
  //   this.ctx.scale(this.scale, this.scale);
  //   this.drawGrid();
  //   this.ctx.restore();
  // };

  // drawGrid() {
  //   const step = 10;
  //   const rangex = window.innerWidth;
  //   const rangey = window.innerHeight;

  //   this.ctx.strokeStyle = "#121212";

  //   for (let x = -rangex; x <= rangex; x += step) {
  //     this.ctx.beginPath();
  //     this.ctx.moveTo(x, -rangey);
  //     this.ctx.lineTo(x, rangey);
  //     this.ctx.stroke();
  //   }

  //   for (let y = -rangey; y <= rangey; y += step) {
  //     this.ctx.beginPath();
  //     this.ctx.moveTo(-rangex, y);
  //     this.ctx.lineTo(rangex, y);
  //     this.ctx.stroke();
  //   }
  // }

  drag(e: any) {
    if (this.selectedTool === "zoom") return;
    e.preventDefault();
    this.offsetX -= e.deltaX;
    this.offsetY -= e.deltaY;
    this.clearCanvas();
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
    // this.drawGrid();

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = (shape as any).color || "white";
      if (shape.type === "rect") {
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
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
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

  zoom(e: WheelEvent) {
    if (this.selectedTool !== "zoom") return;

    e.preventDefault();
    const zoomIntensity = 0.1;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.offsetX) / this.scale;
    const mouseY = (e.clientY - rect.top - this.offsetY) / this.scale;

    const oldScale = this.scale;

    if (e.deltaY < 0) {
      this.scale *= 1 + zoomIntensity / 2;
    } else {
      this.scale *= 1 - zoomIntensity / 2;
    }

    this.scale = Math.max(0.1, Math.min(10, this.scale));

    this.offsetX -= mouseX * (this.scale - oldScale);
    this.offsetY -= mouseY * (this.scale - oldScale);

    this.clearCanvas();
  }

  update(x: number, y: number): number | null {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];

      if (!shape) continue;

      if (shape.type === "rect") {
        if (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        ) {
          this.selectedShapeIndex = i;
          return i;
        }
      } else if (shape.type === "circle") {
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        if (Math.sqrt(dx * dx + dy * dy) <= shape.radius) {
          this.selectedShapeIndex = i;
          return i;
        }
      } else if (shape.type === "line") {
        const { startX, startY, endX, endY } = shape;
        const distanceToSegment = this.getDistanceToSegment(
          x,
          y,
          startX,
          startY,
          endX,
          endY
        );
        if (distanceToSegment <= 5) {
          this.selectedShapeIndex = i;
          return i;
        }
      }
    }

    this.clearCanvas();
    return null;
  }

  getDistanceToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);

    const t = Math.max(
      0,
      Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
    );
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    return Math.hypot(px - closestX, py - closestY);
  }

  private notifyShapeDeleted(id: any) {
    this.socket.send(
      JSON.stringify({
        type: "delete",
        shapeId: id,
        roomId: this.roomId,
      })
    );
  }

  Eraser(e: MouseEvent) {
    const { x, y } = this.getMousePos(e);

    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      console.log(shape)
      if (shape?.type === "rect") {
        if (
          x + this.eraserRadius >= shape.x &&
          x - this.eraserRadius <= shape.x + shape.width &&
          y + this.eraserRadius >= shape.y &&
          y - this.eraserRadius <= shape.y + shape.height
        ) {
          console.log(this.existingShapes);
          const deletedShape = this.existingShapes.splice(i, 1)[0];
          console.log(deletedShape.id);
          const deletedId = deletedShape;
          console.log(deletedId);
          this.notifyShapeDeleted(deletedId);
          this.clearCanvas();
          return;
        }
      } else if (shape?.type === "circle") {
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= shape.radius + this.eraserRadius) {
          const deletedShape = this.existingShapes.splice(i, 1)[0];
          if (!deletedShape?.id) {
            console.log("Deleted shape missing id", deletedShape);
            return;
          }
          this.notifyShapeDeleted(deletedShape.id);
          this.clearCanvas();
          return;
        }
      } else if (shape?.type === "line") {
        const { startX, startY, endX, endY } = shape;
        const distanceToLine = this.getDistanceToSegment(
          x,
          y,
          startX,
          startY,
          endX,
          endY
        );
        if (distanceToLine <= this.eraserRadius) {
          const deletedShape = this.existingShapes.splice(i, 1)[0];
          this.notifyShapeDeleted(deletedShape.id);
          this.clearCanvas();
          return;
        }
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const { x, y } = this.getMousePos(e);
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "eraser") {
      this.Eraser(e);
      return;
    }

    if (this.selectedTool === "move") {
      const idx = this.update(x, y);
      if (idx !== null) {
        const shape = this.existingShapes[idx];
        this.selectedShapeIndex = idx;

        if (shape?.type === "rect") {
          this.dragOffsetX = x - shape.x;
          this.dragOffsetY = y - shape.y;
        } else if (shape?.type === "circle") {
          this.dragOffsetX = x - shape.centerX;
          this.dragOffsetY = y - shape.centerY;
        } else if (shape?.type === "line") {
          this.dragOffsetX = x - shape.startX;
          this.dragOffsetY = y - shape.startY;
        }

        this.isDragging = true;
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    if (this.selectedTool === "move") {
      this.isDragging = false;
      this.selectedShapeIndex = null;
      this.ctx.strokeStyle = this.selectColorTool;
      return;
    }

    const { x: endX, y: endY } = this.getMousePos(e);
    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;
    const color = this.selectColorTool;

    switch (this.selectedTool) {
      case "rect":
        shape = {
          id: crypto.randomUUID(),
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height,
          color,
        };
        break;
      case "circle":
        const radius = Math.max(width, height) / 2;
        shape = {
          id: crypto.randomUUID(),
          type: "circle",
          radius,
          centerX: this.startX + radius,
          centerY: this.startY + radius,
          color,
        };
        break;
      case "line":
        shape = {
          id: crypto.randomUUID(),

          type: "line",
          startX: this.startX,
          startY: this.startY,
          endX,
          color,
          endY,
        };
        break;
    }

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
    const { x: currentX, y: currentY } = this.getMousePos(e);

    if (
      this.selectedTool === "move" &&
      this.isDragging &&
      this.selectedShapeIndex !== null
    ) {
      const shape = this.existingShapes[this.selectedShapeIndex];
      if (shape?.type === "rect") {
        shape.x = currentX - (this.dragOffsetX ?? 0);
        shape.y = currentY - (this.dragOffsetY ?? 0);
      } else if (shape?.type === "circle") {
        shape.centerX = currentX - (this.dragOffsetX ?? 0);
        shape.centerY = currentY - (this.dragOffsetY ?? 0);
      } else if (shape?.type === "line") {
        const dx = currentX - (this.dragOffsetX ?? 0) - shape.startX;
        const dy = currentY - (this.dragOffsetY ?? 0) - shape.startY;
        shape.startX += dx;
        shape.startY += dy;
        shape.endX += dx;
        shape.endY += dy;
      }

      this.clearCanvas();
      return;
    }

    if (!this.clicked) return;

    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.ctx.save();
    this.clearCanvas();
    this.ctx.strokeStyle = this.selectColorTool;
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    switch (this.selectedTool) {
      case "rect":
        this.ctx.strokeRect(this.startX, this.startY, width, height);
        break;
      case "circle":
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
        break;
      case "line":
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        this.ctx.closePath();
        break;
    }

    this.ctx.restore();
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener(
      "wheel",
      (e) => {
        if (this.selectedTool === "move") {
          this.drag(e);
        } else if (this.selectedTool === "zoom") {
          this.zoom(e);
        }
      },
      { passive: false }
    );
  }
}

import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@workspace/backend-common/config";
import { prisma } from "@repo/db/client";
const PORT = Number(8001) || 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  try {
    const url = request.url;
    if (!url) {
      return;
    }
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    const userId = checkUser(token);

    if (userId == null) {
      ws.close();
      return null;
    }

    users.push({
      userId,
      rooms: [],
      ws,
    });

    ws.on("message", async function message(data) {
      let parsedData;
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }

      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === ws);
        user?.rooms.push(parsedData.roomId);
      }

      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (!user) {
          return;
        }
        user.rooms = user?.rooms.filter((x) => x === parsedData.room);
      }

      if (parsedData.type === "delete") {
        const roomId = Number(parsedData.roomId);
        const shapeId = Number(parsedData.shapeId);

        try {
          const messages = await prisma.chat.findMany({
            where: {
              roomId: roomId,
            },
          });

          const target = messages.find((msg) => {
            try {
              const parsed = JSON.parse(msg.message);
              return parsed?.shape?.id === shapeId;
            } catch {
              return false;
            }
          });

          if (!target) {
            console.log("Shape not found with id:", shapeId);
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Shape not found",
                shapeId: shapeId,
              })
            );
            return;
          }
          const deletedShape = await prisma.chat.delete({
            where: {
              id: target.id,
            },
          });

          console.log("Shape deleted successfully:", deletedShape);

          // Optionally broadcast deletion
          // broadcastToRoom(roomId, {
          //   type: "shape_deleted",
          //   shapeId: shapeId,
          //   roomId: roomId,
          // });
        } catch (err) {
          console.error(err);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Failed to delete shape",
              shapeId: shapeId,
            })
          );
        }
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;

        await prisma.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId,
          },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(
              JSON.stringify({
                type: "chat",
                message: message,
                roomId,
              })
            );
          }
        });
      }
    });
  } catch (err) {
    console.log("error", err);
  }
});

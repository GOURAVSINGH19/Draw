import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@Workspace/backend-common/config";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/schema/types";
import { prisma } from "@repo/db/client";
import cors from "cors";
import bcrypt from "bcrypt";
import authMiddleware from "./middleware";
const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:8080"] }));

app.post("/signup", async (req: Request, res: Response) => {
  console.log(req.body)
  const parsedata = CreateUserSchema.safeParse(req.body);
  if (!parsedata.success) {
    res.status(411).json({
      message: "Validation failed",
      errors: parsedata.error.errors,
    });
    return;
  }

  const existingUser = await prisma.user.findMany({
    where: {
      email: parsedata.data.email,
    },
  });

  // if (existingUser) {
  //   res.status(411).json({
  //     message: "Email already taken/Incorrect inputs",
  //   });
  //   return;
  // }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(parsedata.data.password, salt);
    const user = await prisma.user.create({
      data: {
        email: parsedata.data.email,
        name: parsedata.data.name,
        password: hash,
      },
    });
    const userId = user.id;
    res.json({
      message: "User created successfully",
      userId,
    });
  } catch (err) {
    res.status(411).json({
      message: "User already exits with this email",
    });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const parsedata = SigninSchema.safeParse(req.body);
  if (!parsedata.success) {
    res.status(411).json({
      message: "Invalid input",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsedata.data.email,
      },
    });

    if (!user) {
      res.status(403).json({
        message: "Unauthorized: User not found",
      });
      return;
    }

    const isValid = await bcrypt.compare(
      parsedata.data.password,
      user.password
    );

    if (!isValid) {
      res.status(403).json({
        message: "Unauthorized: Invalid password",
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie('token', token, {
      secure: true
    })

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error while logging in",
    });
  }
});

app.post("/room", authMiddleware, async (req: Request, res: Response) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }
  // @ts-ignore: TODO: Fix this
  const userId = req.userId;

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name",
    });
  }
});


app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prisma.room.findFirst({
    where: {
      slug,
    },
  });
  res.json({
    room,
  });
});

app.get("/message/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        id: "desc"
      },
      take: 1000
    });

    res.json({
      messages
    })
  } catch (e) {
    console.log(e);
    res.json({
      messages: []
    })
  }

})

app.listen(3002, () => {
  console.log("Htpp runing......")
});

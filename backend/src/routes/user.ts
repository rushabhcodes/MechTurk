import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "./middleware";
import { createTaskInput } from "./types";

const router = Router();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
  region: "eu-north-1",
});

const prismaClient = new PrismaClient(); //  This is the Prisma client that we will use to interact with the database

router.post("/task", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const body = req.body;
  const parseData = createTaskInput.safeParse(body);
  if (!parseData.success) {
    return res.status(411).json({ message: "Invalid input" });
  }
  let response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title,
        amount: "1",
        signature: parseData.data.signature,
        userId: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        imageUrl: x.imageUrl,
        taskId: response.id,
      })),
    });

    return response;
  });

  res.json({
    id: response.id,
  }   );
});
router.get("/presignedUrl", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;

  const command = new PutObjectCommand({
    Bucket: "mech-turk",
    Key: `user/${userId}/${Math.floor(Math.random() * 1000)}/image.jpg`,
    ContentType: "img/jpg",
  });

  const preSignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  console.log(preSignedUrl);

  res.json({
    preSignedUrl,
  });
});

router.post("/signin", async (req, res) => {
  //  TODO: Implement signin logic
  const hardCodedWalletAddress = "BMSvxdxt1qvuFaPRChY3b5rovEPanJDXksozBhB3EtN2";

  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: hardCodedWalletAddress,
    },
  });
  if (existingUser) {
    const token = jwt.sign(
      { userId: existingUser?.id },
      process.env.JWT_SECRET!
    );
    res.json({ token });
  } else {
    const newUser = await prismaClient.user.create({
      data: {
        address: hardCodedWalletAddress,
      },
    });
    const token = jwt.sign({ userId: newUser?.id }, process.env.JWT_SECRET!);
    res.json({ token });
  }
});

export default router;

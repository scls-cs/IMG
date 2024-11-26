import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'  

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), "public", "upload_image");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("创建目录失败:", err);
      return NextResponse.json({ error: "创建上传目录失败" }, { status: 500 });
    }
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.name.replace(/\.[^/.]+$/, "") +
      "-" +
      uniqueSuffix +
      path.extname(file.name);

    const filepath = path.join(uploadDir, filename);
    console.log("file path is ", filepath);
    await writeFile(filepath, buffer);
    try {
      console.log("Analyzing image...");
      const analyzeImage = await fetch("http://localhost:3000/api/analyze", {
        method: "POST", // 添加 HTTP 方法
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename,
        }),
      });
      const analyzeData = await analyzeImage.json();
      console.log(analyzeData);
    } catch (error) {
      console.log("error analyzing image:", error);
    }

    return NextResponse.json({
      success: true,
      filename,
      path: `/upload_image/${filename}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

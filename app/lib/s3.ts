import axios from "axios";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 使用新版 SDK 创建 S3 客户端
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function downloadAndUploadImage(
  imageUrl: string,
  bucketName: string,
  s3Key: string
) {
  try {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    // 使用新版 SDK 上传文件
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: response.data,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  } catch (error) {
    console.error("Error downloading and uploading image:", error);
    throw error;
  }
}

export async function downloadImage(imageUrl: string, outputPath: string) {
  try {
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      let error: Error | null = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });

      writer.on("close", () => {
        if (!error) {
          resolve(null);
        }
      });
    });
  } catch (e) {
    console.log("upload failed:", e);
    throw e;
  }
}

export async function uploadLocalFileToS3(
  localFilePath: string,
  bucketName: string,
  s3Key: string
): Promise<string> {
  try {
    const fileStream = fs.createReadStream(localFilePath);

    // 配置上传参数
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileStream,
      ContentType: "image/jpeg", // 根据实际文件类型调整
    };

    // 执行上传
    await s3Client.send(new PutObjectCommand(uploadParams));

    // 返回文件的 S3 URL
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

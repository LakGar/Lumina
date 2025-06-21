import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined;
};

export const s3Client =
  globalForS3.s3 ??
  new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3Client;

export const generateSignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn: number = 3600
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

export const generateSignedDownloadUrl = async (
  key: string,
  expiresIn: number = 3600
) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

export default s3Client;

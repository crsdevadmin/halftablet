import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

/**
 * File storage abstraction.
 * - AWS_S3_BUCKET set → uploads go to S3 (private, encrypted at rest)
 * - otherwise → local ./uploads directory (dev on your machine)
 *
 * Credentials: on your machine, AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
 * env vars; on Amplify/EC2, prefer an IAM role (the SDK picks it up
 * automatically — no keys in env).
 */
export async function saveUpload(
  name: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET

  if (bucket) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' })
    const key = `prescriptions/${name}`
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    }))
    return `s3://${bucket}/${key}`
  }

  const dir = path.join(process.cwd(), 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), data)
  return `uploads/${name}`
}

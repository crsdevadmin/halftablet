import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * GET /api/prescriptions/file?id=<prescriptionId>
 * Staff or the uploading patient can view the file.
 * S3 files → redirect to a short-lived signed URL; local files → streamed.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id') ?? ''
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: { order: { select: { userId: true } } },
  })
  if (!prescription) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'PHARMACIST'
  const isOwner =
    prescription.userId === session.user.id || prescription.order?.userId === session.user.id
  if (!isStaff && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const filePath = prescription.filePath

  if (filePath.startsWith('s3://')) {
    const [, , bucket, ...keyParts] = filePath.split('/')
    const key = keyParts.join('/')
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const client = new S3Client({ region: process.env.AWS_REGION || process.env.REGION || 'ap-south-1' })
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: 300,
    })
    return NextResponse.redirect(url)
  }

  // Local dev fallback
  const abs = path.join(process.cwd(), filePath)
  try {
    const data = await readFile(abs)
    const ext = path.extname(abs).toLowerCase()
    const type = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png' : 'image/jpeg'
    return new NextResponse(new Uint8Array(data), { headers: { 'content-type': type } })
  } catch {
    return NextResponse.json({ error: 'File missing' }, { status: 404 })
  }
}

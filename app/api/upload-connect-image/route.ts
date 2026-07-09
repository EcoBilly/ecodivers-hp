import { NextRequest, NextResponse } from 'next/server';
import { getStorageAdmin } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json({ error: 'Missing file or path' }, { status: 400 });
    }

    const storage = getStorageAdmin();
    if (!storage) {
      return NextResponse.json({ error: 'Storage not initialized' }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = storage.bucket();
    const fileRef = bucket.file(path);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

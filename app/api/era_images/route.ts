import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'era_Images');
    const files = await fs.readdir(imagesDir);
    // Filter for image files (jpg, jpeg, png, gif)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    return NextResponse.json({ images: imageFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

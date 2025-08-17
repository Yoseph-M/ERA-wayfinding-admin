
import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

export async function PUT(req: NextRequest) {
  try {
    const { id, name, description } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: 'Block ID and name are required' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE era_data SET block = ?, description = ? WHERE block = ?');
    const info = stmt.run(name, description, id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Block not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Block updated successfully', id, name, description }, { status: 200 });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ error: 'Could not update block' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function GET() {
  try {
    const personnel = db.prepare('SELECT id, wname, wnameamh, wtitle, wtitleamh, wcontact, department, departmentamh, photo_url FROM era_data').all();
    return NextResponse.json(personnel, { status: 200 });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wname, wnameamh, wtitle, wtitleamh, wcontact, department, photoUrl } = await req.json();
    if (!wname || !wtitle || !department) {
      return NextResponse.json({ error: 'Name, title, and department are required' }, { status: 400 });
    }

    let photo_url = null;
    if (photoUrl) {
      const base64Data = photoUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${wname.replace(/\s+/g, '-')}.png`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);
      photo_url = `/uploads/${fileName}`;
    }

    const stmt = db.prepare(`
      INSERT INTO era_data (
        id, wname, wnameamh, wtitle, wtitleamh, wcontact, department, photo_url
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      wname, wnameamh || null, wtitle, wtitleamh || null, wcontact || null, department, photo_url
    );

    return NextResponse.json({ wname, wnameamh, wtitle, wtitleamh, wcontact, department, photo_url }, { status: 201 });
  } catch (error) {
    console.error('Error creating personnel:', error);
    return NextResponse.json({ error: 'Could not create personnel' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, wname, wnameamh, wtitle, wtitleamh, wcontact, department, photoUrl } = await req.json();
    if (!id || !wname || !wtitle || !department) {
      return NextResponse.json({ error: 'ID, name, title, and department are required' }, { status: 400 });
    }

    let photo_url = null;
    if (photoUrl) {
      if (photoUrl.startsWith('data:image')) {
        const base64Data = photoUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `${Date.now()}-${wname.replace(/\s+/g, '-')}.png`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);
        photo_url = `/uploads/${fileName}`;
      } else {
        photo_url = photoUrl;
      }
    }

    const stmt = db.prepare('UPDATE era_data SET wname = ?, wnameamh = ?, wtitle = ?, wtitleamh = ?, wcontact = ?, department = ?, photo_url = ? WHERE id = ?');
    const info = stmt.run(wname, wnameamh || null, wtitle, wtitleamh || null, wcontact || null, department, photo_url, id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Personnel not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Personnel updated successfully', id, wname, wnameamh, wtitle, wtitleamh, wcontact, department, photo_url }, { status: 200 });
  } catch (error) {
    console.error('Error updating personnel:', error);
    return NextResponse.json({ error: 'Could not update personnel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Personnel ID is required' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE era_data SET wname = NULL, wnameamh = NULL, photo_url = NULL WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Personnel not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Personnel data cleared successfully', id }, { status: 200 });
  } catch (error) {
    console.error('Error clearing personnel data:', error);
    return NextResponse.json({ error: 'Could not clear personnel data' }, { status: 500 });
  }
}
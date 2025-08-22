
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import Database from 'better-sqlite3'

export async function GET() {
  try {
    const db = new Database('era.db', { readonly: true })
    const comments = db.prepare('SELECT * FROM general_comm').all()
    db.close()
    return NextResponse.json(comments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  try {
    const db = new Database('era.db');
    const stmt = db.prepare('DELETE FROM general_comm WHERE id = ?');
    const result = stmt.run(id);
    db.close();

    if (result.changes > 0) {
      return NextResponse.json({ message: 'Comment deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'

export async function GET() {
  try {
    const db = new Database('era.db', { readonly: true })
    const comments = db.prepare('SELECT * FROM personnel_comm').all()
    db.close()
    return NextResponse.json(comments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = new Database('era.db');
    const stmt = db.prepare('DELETE FROM personnel_comm WHERE id = ?');
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
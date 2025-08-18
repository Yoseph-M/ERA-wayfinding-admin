import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if department exists
    const department = db.prepare(
      'SELECT id FROM era_data WHERE department = ? LIMIT 1'
    ).get(name);

    return NextResponse.json({
      exists: !!department,
      id: department?.id || null
    });
    
  } catch (error) {
    console.error('Error checking department:', error);
    return NextResponse.json(
      { error: 'Failed to check department' },
      { status: 500 }
    );
  }
}

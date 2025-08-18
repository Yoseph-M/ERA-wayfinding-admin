import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

export async function GET() {
  try {
    // Get all departments that aren't already assigned to a block
    const departments = db.prepare(`
      SELECT DISTINCT department as name, id 
      FROM era_data 
      WHERE department IS NOT NULL 
      AND department != ''
      ORDER BY department
    `).all();
    
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Error fetching available departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available departments' }, 
      { status: 500 }
    );
  }
}

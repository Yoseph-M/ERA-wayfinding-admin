import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

export async function GET() {
  try {
    const allRows = db.prepare('SELECT * FROM era_data').all();
    return NextResponse.json(allRows, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newRecord = await req.json();
    const {
      id, block, decat, department, departmentamh, floor, officeno,
      wcontact, wid, wname, wnameamh, wtitle, wtitleamh
    } = newRecord;

    const stmt = db.prepare(`
      INSERT INTO era_data (
        id, block, decat, department, departmentamh, floor, officeno,
        wcontact, wid, wname, wnameamh, wtitle, wtitleamh
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, block, decat, department, departmentamh, floor, officeno,
      wcontact, wid, wname, wnameamh, wtitle, wtitleamh
    );

    return NextResponse.json({ message: 'Record added successfully', newRecord }, { status: 201 });
  } catch (error) {
    console.error('Error adding record:', error);
    return NextResponse.json({ error: 'Failed to add record' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const updatedFields = await req.json();
    const { id } = updatedFields;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for update' }, { status: 400 });
    }

    // Fetch the existing record
    const getStmt = db.prepare('SELECT * FROM era_data WHERE id = ?');
    const existingRecord = getStmt.get(id);

    if (!existingRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Merge existing record with updated fields
    const mergedRecord = { ...existingRecord, ...updatedFields };

    // Prepare the update statement dynamically
    const fieldsToUpdate = Object.keys(mergedRecord).filter(key => key !== 'id');
    const setClauses = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
    const params = fieldsToUpdate.map(key => mergedRecord[key]);

    const stmt = db.prepare(`UPDATE era_data SET ${setClauses} WHERE id = ?`);
    const info = stmt.run(...params, id);

    if (info.changes === 0) {
      return NextResponse.json({ message: 'No changes made' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Record updated successfully', updatedRecord: mergedRecord }, { status: 200 });
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const stmt = db.prepare('DELETE FROM era_data WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
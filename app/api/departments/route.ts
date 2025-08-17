import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';


const dbPath = path.resolve(process.cwd(), 'era.db');
const db = new Database(dbPath);

export async function GET() {
  try {
    const departments = db.prepare('SELECT id, department, block, floor, officeno FROM era_data WHERE department IS NOT NULL AND departmentamh IS NOT NULL').all();
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { department, departmentamh, floor, officeNumber, building } = await req.json();
    if (!department || !floor || !officeNumber || !building) {
      return NextResponse.json({ error: 'Department name, floor, office number, and building are required' }, { status: 400 });
    }

    // Check if department already exists
    const existingDepartment = db.prepare('SELECT department FROM era_data WHERE department = ?').get(department);
    if (existingDepartment) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
    }

    // For simplicity, when adding a new department, we'll insert a dummy record
    // with a new UUID as ID and other fields as null or default values.
    // In a real application, you might have a dedicated 'departments' table.
    const stmt = db.prepare(`
      INSERT INTO era_data (
        id, block, decat, department, departmentamh, floor, officeno,
        wcontact, wid, wname, wnameamh, wtitle, wtitleamh
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      building, null, department, departmentamh || null, floor, officeNumber,
      null, null, null, null, null, null
    );

    return NextResponse.json({ department, departmentamh, floor, officeNumber, building }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Could not create department' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, newDepartment, newDepartmentAmh, floor, officeNumber, building } = await req.json();
    if (!id || !newDepartment || !floor || !officeNumber || !building) {
      return NextResponse.json({ error: 'Department ID, name, floor, office number, and building are required' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE era_data SET department = ?, departmentamh = ?, floor = ?, officeno = ?, block = ? WHERE id = ?');
    const info = stmt.run(newDepartment, newDepartmentAmh || null, floor, officeNumber, building, id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Department not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department updated successfully', id, newDepartment, newDepartmentAmh, floor, officeNumber, building }, { status: 200 });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Could not update department' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    const stmt = db.prepare('DELETE FROM era_data WHERE id = ?');
    const info = stmt.run(id);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Department not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department data cleared successfully', id }, { status: 200 });
  } catch (error) {
    console.error('Error clearing department data:', error);
    return NextResponse.json({ error: 'Could not clear department data' }, { status: 500 });
  }
}

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
    const body = await req.json();
    console.log('Received POST request with body:', body);
    const { newDepartment, newDepartmentAmh, floor, officeNumber, building } = body;
    if (!newDepartment || !floor || !officeNumber || !building) {
      return NextResponse.json({ error: 'Department name, floor, office number, and building are required' }, { status: 400 });
    }


    // Check if department with same name, floor, office number, and building exists
    const existingDepartment = db.prepare(
      'SELECT department FROM era_data WHERE department = ? AND floor = ? AND officeno = ? AND block = ?'
    ).get(newDepartment, floor, officeNumber, building);
    if (existingDepartment) {
      return NextResponse.json({ error: 'Department with these details already exists' }, { status: 409 });
    }


    // Insert only into existing columns (removed decat and wid)
    const stmt = db.prepare(`
      INSERT INTO era_data (
        id, block, department, departmentamh, floor, officeno,
        wcontact, wname, wnameamh, wtitle, wtitleamh
      ) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      building, newDepartment, newDepartmentAmh || null, floor, officeNumber,
      null, null, null, null, null
    );

    return NextResponse.json({ department: newDepartment, departmentamh: newDepartmentAmh, floor, officeNumber, building }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Could not create department' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received PUT request with body:', body);
    const { id, newDepartment, newDepartmentAmh, floor, officeNumber, building } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Build dynamic update query based on provided fields
    const fields = [];
    const values = [];
    if (newDepartment !== undefined) {
      fields.push('department = ?');
      values.push(newDepartment);
    }
    if (newDepartmentAmh !== undefined) {
      fields.push('departmentamh = ?');
      values.push(newDepartmentAmh);
    }
    if (floor !== undefined) {
      fields.push('floor = ?');
      values.push(floor);
    }
    if (officeNumber !== undefined) {
      fields.push('officeno = ?');
      values.push(officeNumber);
    }
    if (building !== undefined) {
      fields.push('block = ?');
      values.push(building);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const sql = `UPDATE era_data SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    const stmt = db.prepare(sql);
    const info = stmt.run(...values);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Department not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Could not update department' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { department } = await req.json();
    if (!department) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    // Instead of deleting, we clear the department fields
    const stmt = db.prepare('UPDATE era_data SET department = NULL, departmentamh = NULL WHERE department = ?');
    const info = stmt.run(department);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department data cleared successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing department data:', error);
    return NextResponse.json({ error: 'Could not clear department data' }, { status: 500 });
  }
}
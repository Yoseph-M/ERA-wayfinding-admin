
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const csvPath = path.join(process.cwd(), 'era.csv');

function readDepartments() {
  if (!fs.existsSync(csvPath)) return [];
  const csv = fs.readFileSync(csvPath, 'utf8');
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return Array.isArray(data) ? data : [];
}

function writeDepartments(departments: any[]) {
  const csv = Papa.unparse(departments);
  fs.writeFileSync(csvPath, csv, 'utf8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      try {
        const csv = fs.readFileSync(csvPath, 'utf8');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csv);
      } catch (err) {
        res.status(500).json({ error: 'Could not read CSV file' });
      }
      break;
    }
    case 'POST': {
      // Create
      try {
        const departments = readDepartments();
        const newDepartment = req.body;
        // Assign a unique id
        newDepartment.id = Date.now().toString();
        departments.push(newDepartment);
        writeDepartments(departments);
        res.status(201).json(newDepartment);
      } catch (err) {
        res.status(500).json({ error: 'Could not create department' });
      }
      break;
    }
    case 'PUT': {
      // Update
      try {
        // Debug: log incoming request body and all department IDs
        if (process.env.NODE_ENV !== 'production') {
          console.log('PUT /api/departments request body:', req.body);
        }
        const { id, ...update } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Missing id in request body' });
        }
        let departments = readDepartments();
        if (process.env.NODE_ENV !== 'production') {
          console.log('All department IDs:', departments.map((d: any) => d.id));
        }
        let found = false;
        // Pad and trim the id to match the CSV id format (e.g., '01', '02')
        const padId = (val: string) => {
          if (!val) return val;
          const idLen = departments.length > 0 ? ((departments[0] as any).id || '').trim().length : 2;
          return val.toString().trim().padStart(idLen, '0');
        };
        const paddedId = padId(id);
        departments = departments.map((dept: any) => {
          const deptId = (dept.id || '').toString().trim();
          if (deptId === paddedId) {
            found = true;
            return { ...dept, ...update, id: paddedId };
          }
          return dept;
        });
        if (!found) {
          // Debug info for development
          if (process.env.NODE_ENV !== 'production') {
            console.error('Update failed: id not found', { id, paddedId, allIds: departments.map((d: any) => d.id) });
          }
          return res.status(404).json({ error: 'Department not found' });
        }
        writeDepartments(departments);
        res.status(200).json({ id: paddedId, ...update });
      } catch (err) {
        res.status(500).json({ error: 'Could not update department' });
      }
      break;
    }
    case 'DELETE': {
      // Delete
      try {
        const { id } = req.body;
        let departments = readDepartments();
        // Pad and trim the id to match the CSV id format
        const padId = (val: string) => {
          if (!val) return val;
          const idLen = departments.length > 0 ? ((departments[0] as any).id || '').trim().length : 2;
          return val.toString().trim().padStart(idLen, '0');
        };
        const paddedId = padId(id);
        const initialLength = departments.length;
        departments = departments.filter((dept: any) => {
          const deptId = (dept.id || '').toString().trim();
          return deptId !== paddedId;
        });
        if (departments.length === initialLength) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Delete failed: id not found', { id, paddedId, allIds: departments.map((d: any) => d.id) });
          }
          return res.status(404).json({ error: 'Department not found' });
        }
        writeDepartments(departments);
        res.status(204).end();
      } catch (err) {
        res.status(500).json({ error: 'Could not delete department' });
      }
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

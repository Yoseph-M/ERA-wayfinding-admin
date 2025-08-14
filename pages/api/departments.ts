
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

const csvPath = path.join(process.cwd(), 'era.csv');

function readDepartments() {
  if (!fs.existsSync(csvPath)) return { data: [], fields: [] };
  const csv = fs.readFileSync(csvPath, 'utf8');
  const { data, meta } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return { data: Array.isArray(data) ? data : [], fields: meta.fields || [] };
}

function writeDepartments(departments: any[], fields: string[]) {
  const csv = Papa.unparse(departments, { columns: fields });
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
        const { data, fields } = readDepartments(); // Destructure data and fields
        const newDepartment = req.body;
        // Assign a unique id using uuid
        newDepartment.id = uuidv4();
        data.push(newDepartment);
        writeDepartments(data, fields); // Pass data and fields
        res.status(201).json(newDepartment);
      } catch (err) {
        res.status(500).json({ error: 'Could not create department' });
      }
      break;
    }
    case 'PUT': {
      // Update
      try {
        const { id, ...update } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Missing id in request body' });
        }
        const { data, fields } = readDepartments(); // Destructure data and fields
        let found = false;
        const updatedData = data.map((dept: any) => {
          const deptId = (dept.id || '').toString().trim();
          if (deptId === id) { // Directly compare with the provided id
            found = true;
            return { ...dept, ...update, id: id }; // Ensure id is preserved
          }
          return dept;
        });
        if (!found) {
          return res.status(404).json({ error: 'Department not found' });
        }
        writeDepartments(updatedData, fields); // Pass updatedData and fields
        res.status(200).json({ id: id, ...update });
      } catch (err) {
        res.status(500).json({ error: 'Could not update department' });
      }
      break;
    }
    case 'DELETE': {
      // Delete
      try {
        const { data, fields } = readDepartments(); // Destructure data and fields
        const { id } = req.body;
        const initialLength = data.length;
        const filteredData = data.filter((dept: any) => {
          const deptId = (dept.id || '').toString().trim();
          return deptId !== id; // Directly compare with the provided id
        });
        if (filteredData.length === initialLength) {
          return res.status(404).json({ error: 'Department not found' });
        }
        writeDepartments(filteredData, fields); // Pass filteredData and fields
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

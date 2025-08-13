const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const csvPath = path.join(process.cwd(), 'era.csv');

function readCsv() {
  const csv = fs.readFileSync(csvPath, 'utf8');
  const { data, errors, meta } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return { data, errors, meta, csv };
}

function writeCsv(data, fields) {
  const columns = fields || (data.length > 0 ? Object.keys(data[0]) : []);
  const csv = Papa.unparse(data, { columns });
  fs.writeFileSync(csvPath, csv, 'utf8');
}

function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const csv = fs.readFileSync(csvPath, 'utf8');
      res.setHeader('Content-Type', 'text/csv');
      res.status(200).send(csv);
    } catch (err) {
      res.status(500).json({ error: 'Could not read CSV file' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const { data, meta } = readCsv();
      const { id, ...updateFields } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      let updated = false;
      const updatedData = data.map(row => {
        // Update by department or personnel or any unique field
        if (row.department === id || row.personnel === id || row.id === id || row.name === id) {
          updated = true;
          return { ...row, ...updateFields };
        }
        return row;
      });
      if (!updated) return res.status(404).json({ error: 'Record not found' });
      writeCsv(updatedData, meta.fields);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Could not update record' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const { data, meta } = readCsv();
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const filtered = data.filter(row => row.department !== id && row.personnel !== id && row.id !== id && row.name !== id);
      if (filtered.length === data.length) return res.status(404).json({ error: 'Record not found' });
      writeCsv(filtered, meta.fields);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Could not delete record' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

module.exports = handler;
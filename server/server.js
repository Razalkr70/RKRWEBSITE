const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Parser } = require('json2csv');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB Error:', err.message);
  else {
    console.log('Connected to SQLite database.');
    db.serialize(() => {
      // Create tables for data we want to report on
      db.run(`CREATE TABLE IF NOT EXISTS leads (id TEXT, name TEXT, company TEXT, status TEXT, value REAL)`);
      db.run(`CREATE TABLE IF NOT EXISTS projects (id TEXT, name TEXT, client_name TEXT, status TEXT, progress INTEGER)`);
      db.run(`CREATE TABLE IF NOT EXISTS invoices (id TEXT, invoice_id TEXT, client_id TEXT, status TEXT, total REAL)`);
      
      // Table for Schedules
      db.run(`CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, frequency TEXT, email TEXT, last_sent TEXT)`);
    });
  }
});

// 2. Sync Endpoint (React calls this to send data to the backend)
app.post('/api/sync', (req, res) => {
  const { leads, projects, invoices, schedules } = req.body;

  db.serialize(() => {
    // Clear old data and insert new (simple sync approach)
    if (leads) {
      db.run('DELETE FROM leads');
      const stmt = db.prepare('INSERT INTO leads VALUES (?, ?, ?, ?, ?)');
      leads.forEach(l => stmt.run(l.id, l.name, l.company, l.status, l.value));
      stmt.finalize();
    }
    
    if (projects) {
      db.run('DELETE FROM projects');
      const stmt = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?, ?)');
      projects.forEach(p => stmt.run(p.id, p.name, p.client_name, p.status, p.progress));
      stmt.finalize();
    }
    
    if (invoices) {
      db.run('DELETE FROM invoices');
      const stmt = db.prepare('INSERT INTO invoices VALUES (?, ?, ?, ?, ?)');
      invoices.forEach(i => stmt.run(i.id, i.invoice_id, i.client_id, i.status, i.total));
      stmt.finalize();
    }

    if (schedules) {
      db.run('DELETE FROM schedules');
      const stmt = db.prepare('INSERT INTO schedules (type, frequency, email, last_sent) VALUES (?, ?, ?, ?)');
      schedules.forEach(s => stmt.run(s.type, s.frequency, s.email, s.last_sent || null));
      stmt.finalize();
    }
  });

  res.json({ success: true, message: 'Data synced to database successfully' });
});

// 3. Nodemailer Setup (Ethereal - Fake SMTP for testing)
let transporter;
nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return;
  }
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
  console.log('Ethereal Email initialized. Emails sent will generate a preview URL.');
});

// 4. Auto-Mailing Logic
const generateAndSendReport = (schedule) => {
  const tableName = schedule.type === 'financials' ? 'invoices' : schedule.type;
  
  db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
    if (err || rows.length === 0) {
      console.log(`No data found for ${schedule.type}`);
      return;
    }
    
    try {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(rows);

      const mailOptions = {
        from: '"RKR Solutions System" <admin@rkrsolutions.com>',
        to: schedule.email,
        subject: `Automated Report: ${schedule.type} (${schedule.frequency})`,
        text: `Hello,

Attached is your requested ${schedule.frequency} report for ${schedule.type}.

Regards,
RKR Solutions System`,
        attachments: [
          {
            filename: `${schedule.type}_report.csv`,
            content: csv
          }
        ]
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log('Error sending mail:', error);
        }
        console.log(`Report sent to ${schedule.email}! Preview URL: `, nodemailer.getTestMessageUrl(info));
        
        // Update last sent time
        db.run('UPDATE schedules SET last_sent = ? WHERE id = ?', [new Date().toISOString(), schedule.id]);
      });
    } catch (parseErr) {
      console.error('CSV Parsing Error:', parseErr);
    }
  });
};

// 5. Cron Job (Runs every minute for demo purposes, usually would be '0 0 * * *' for daily)
cron.schedule('* * * * *', () => {
  console.log('Cron Job Running: Checking for scheduled reports...');
  
  db.all('SELECT * FROM schedules', (err, schedules) => {
    if (err) return;
    
    schedules.forEach(schedule => {
      // In a real app, you check frequency and last_sent to determine if it's time to send.
      // For this demo, we will just send it if it hasn't been sent in the last 2 minutes.
      const lastSent = schedule.last_sent ? new Date(schedule.last_sent) : new Date(0);
      const minutesSinceLast = (new Date() - lastSent) / 1000 / 60;
      
      // Force send every 2 minutes for demo purposes (so the user can see it work)
      if (minutesSinceLast >= 2) {
        console.log(`Triggering report generation for ${schedule.email} (${schedule.type})`);
        generateAndSendReport(schedule);
      }
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

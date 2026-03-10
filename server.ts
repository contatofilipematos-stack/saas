import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("oficina.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS workshops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workshop_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workshop_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    default_km_interval INTEGER,
    default_month_interval INTEGER,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workshop_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    plate TEXT NOT NULL,
    model TEXT NOT NULL,
    make TEXT,
    year INTEGER,
    last_mileage INTEGER,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    maintenance_type_id INTEGER,
    service_type TEXT NOT NULL,
    date TEXT NOT NULL,
    mileage INTEGER NOT NULL,
    price REAL,
    notes TEXT,
    next_maintenance_date TEXT,
    next_maintenance_mileage INTEGER,
    reminded INTEGER DEFAULT 0,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (maintenance_type_id) REFERENCES maintenance_types(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Mock (For MVP, we'll use a hardcoded workshop_id = 1)
  const WORKSHOP_ID = 1;
  
  // Ensure created_at column exists in customers table
  try {
    db.prepare("SELECT created_at FROM customers LIMIT 1").get();
  } catch (e) {
    db.prepare("ALTER TABLE customers ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP").run();
  }

  // Ensure default workshop and user exist
  const workshop = db.prepare("SELECT * FROM workshops WHERE id = ?").get(WORKSHOP_ID);
  if (!workshop) {
    db.prepare("INSERT INTO workshops (name, address, phone) VALUES (?, ?, ?)").run(
      "Oficina Precision", "Rua das Peças, 123", "(11) 98888-7777"
    );
    db.prepare("INSERT INTO users (workshop_id, name, email, password) VALUES (?, ?, ?, ?)").run(
      WORKSHOP_ID, "Dono da Oficina", "contato@oficina.com", "123456"
    );
    
    // Default maintenance types
    const types = [
      { name: 'Troca de Óleo', km: 10000, months: 6 },
      { name: 'Filtro de Ar', km: 15000, months: 12 },
      { name: 'Correia Dentada', km: 50000, months: 48 },
      { name: 'Revisão Geral', km: 20000, months: 12 },
      { name: 'Freios', km: 30000, months: 24 }
    ];
    const insertType = db.prepare("INSERT INTO maintenance_types (workshop_id, name, default_km_interval, default_month_interval) VALUES (?, ?, ?, ?)");
    types.forEach(t => insertType.run(WORKSHOP_ID, t.name, t.km, t.months));
  }

  // API Routes
  app.get("/api/stats", (req, res) => {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "";
    const params: any[] = [WORKSHOP_ID];
    
    if (startDate && endDate) {
      dateFilter = " AND s.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers WHERE workshop_id = ?").get(WORKSHOP_ID).count;
    const totalVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles v JOIN customers c ON v.customer_id = c.id WHERE c.workshop_id = ?").get(WORKSHOP_ID).count;
    
    const totalServices = db.prepare(`
      SELECT COUNT(*) as count 
      FROM services s 
      JOIN vehicles v ON s.vehicle_id = v.id 
      JOIN customers c ON v.customer_id = c.id 
      WHERE c.workshop_id = ? ${dateFilter.replace('s.date', 's.date')}
    `).get(...params).count;

    const periodRevenue = db.prepare(`
      SELECT SUM(price) as total 
      FROM services s 
      JOIN vehicles v ON s.vehicle_id = v.id 
      JOIN customers c ON v.customer_id = c.id 
      WHERE c.workshop_id = ? ${dateFilter}
    `).get(...params).total || 0;

    // Pending reminders
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const pendingReminders = db.prepare(`
      SELECT s.*, v.plate, v.model, c.name as customer_name, c.phone
      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      WHERE c.workshop_id = ? AND s.next_maintenance_date <= ? AND s.reminded = 0
      ORDER BY s.next_maintenance_date ASC
    `).all(WORKSHOP_ID, nextWeekStr);

    const recentServices = db.prepare(`
      SELECT s.*, v.plate, v.model, c.name as customer_name
      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      WHERE c.workshop_id = ?
      ORDER BY s.date DESC
      LIMIT 5
    `).all(WORKSHOP_ID);

    res.json({ 
      totalCustomers, 
      totalVehicles, 
      totalServices, 
      monthlyRevenue: periodRevenue, 
      pendingReminders,
      recentServices
    });
  });

  app.get("/api/maintenance-types", (req, res) => {
    const types = db.prepare("SELECT * FROM maintenance_types WHERE workshop_id = ?").all(WORKSHOP_ID);
    res.json(types);
  });

  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers WHERE workshop_id = ?").all(WORKSHOP_ID);
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { name, phone, email } = req.body;
    const result = db.prepare("INSERT INTO customers (workshop_id, name, phone, email) VALUES (?, ?, ?, ?)").run(WORKSHOP_ID, name, phone, email);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/customers/:id/vehicles", (req, res) => {
    const vehicles = db.prepare("SELECT * FROM vehicles WHERE customer_id = ?").all(req.params.id);
    res.json(vehicles);
  });

  app.post("/api/vehicles", (req, res) => {
    const { customer_id, plate, model, make, year, last_mileage } = req.body;
    const result = db.prepare("INSERT INTO vehicles (customer_id, plate, model, make, year, last_mileage) VALUES (?, ?, ?, ?, ?, ?)").run(customer_id, plate, model, make, year, last_mileage);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/services", (req, res) => {
    const { vehicle_id, maintenance_type_id, service_type, date, mileage, price, notes, next_maintenance_date, next_maintenance_mileage } = req.body;
    const result = db.prepare(`
      INSERT INTO services (vehicle_id, maintenance_type_id, service_type, date, mileage, price, notes, next_maintenance_date, next_maintenance_mileage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(vehicle_id, maintenance_type_id, service_type, date, mileage, price, notes, next_maintenance_date, next_maintenance_mileage);
    
    db.prepare("UPDATE vehicles SET last_mileage = ? WHERE id = ?").run(mileage, vehicle_id);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/services/:id/remind", (req, res) => {
    db.prepare("UPDATE services SET reminded = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/reports/revenue", (req, res) => {
    const data = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, SUM(price) as total
      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      JOIN customers c ON v.customer_id = c.id
      WHERE c.workshop_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `).all(WORKSHOP_ID);
    res.json(data);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

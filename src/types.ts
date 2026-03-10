export interface MaintenanceType {
  id: number;
  name: string;
  default_km_interval: number;
  default_month_interval: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Vehicle {
  id: number;
  customer_id: number;
  plate: string;
  model: string;
  make: string;
  year: number;
  last_mileage: number;
}

export interface Service {
  id: number;
  vehicle_id: number;
  maintenance_type_id?: number;
  service_type: string;
  date: string;
  mileage: number;
  price: number;
  notes: string;
  next_maintenance_date: string;
  next_maintenance_mileage: number;
  reminded: number;
}

export interface PendingReminder extends Service {
  plate: string;
  model: string;
  customer_name: string;
  phone: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  totalServices: number;
  monthlyRevenue: number;
  pendingReminders: PendingReminder[];
  recentServices: (Service & { plate: string; model: string; customer_name: string })[];
}

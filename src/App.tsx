import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Bell, 
  Plus, 
  Search, 
  MessageSquare, 
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Calendar,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, Vehicle, Service, DashboardStats, PendingReminder, MaintenanceType } from './types';

const API_URL = '';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'services' | 'reports' | 'settings'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('esse mes');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchCustomers();
    fetchMaintenanceTypes();
  }, [dateRange, customDates]);

  const getDateParams = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (dateRange) {
      case 'hoje':
        start = today;
        end = today;
        break;
      case 'ontem':
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case 'ultimos 7 dias':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'ultimos 15 dias':
        start = new Date(today);
        start.setDate(today.getDate() - 15);
        break;
      case 'esse mes':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'mes passado':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'personalizado':
        return { startDate: customDates.start, endDate: customDates.end };
      case 'maximo':
        return { startDate: '', endDate: '' };
      default:
        return { startDate: '', endDate: '' };
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const fetchStats = async () => {
    try {
      const { startDate, endDate } = getDateParams();
      let url = `${API_URL}/api/stats`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchMaintenanceTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance-types`);
      const data = await res.json();
      setMaintenanceTypes(data);
    } catch (error) {
      console.error('Error fetching maintenance types:', error);
    }
  };

  const sendWhatsApp = async (reminder: PendingReminder) => {
    const message = `Olá ${reminder.customer_name}! Aqui é da Oficina Precision. Notamos que já está chegando a hora da manutenção preventiva do seu ${reminder.model} (${reminder.plate}). A data prevista é ${new Date(reminder.next_maintenance_date).toLocaleDateString('pt-BR')}. Gostaria de agendar um horário?`;
    const encodedMessage = encodeURIComponent(message);
    const phone = reminder.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    
    // Mark as reminded
    await fetch(`/api/services/${reminder.id}/remind`, { method: 'POST' });
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 border-bottom border-black/5">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="text-emerald-600" />
            <span>MecânicaPro</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-black/5 text-gray-500'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-black/5 text-gray-500'}`}
          >
            <Users size={20} />
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-black/5 text-gray-500'}`}
          >
            <Wrench size={20} />
            Serviços
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-black/5 text-gray-500'}`}
          >
            <TrendingUp size={20} />
            Relatórios
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-black/5 text-gray-500'}`}
          >
            <Bell size={20} />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="bg-emerald-900 text-white p-4 rounded-2xl">
            <p className="text-xs opacity-70 uppercase tracking-wider font-bold mb-1">Plano Pro</p>
            <p className="text-sm font-medium">Oficina Precision</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                  <p className="text-gray-500">Bem-vindo de volta! Aqui está o resumo da sua oficina.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                      className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm hover:border-emerald-200 transition-all group"
                    >
                      <Calendar size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm font-bold text-gray-600 capitalize">{dateRange}</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDateMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDateMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-black/5 shadow-xl z-50 py-2 overflow-hidden"
                        >
                          {[
                            'hoje', 'ontem', 'ultimos 7 dias', 'ultimos 15 dias', 
                            'esse mes', 'mes passado', 'personalizado', 'maximo'
                          ].map((range) => (
                            <button
                              key={range}
                              onClick={() => {
                                setDateRange(range);
                                setIsDateMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                dateRange === range 
                                  ? 'bg-emerald-50 text-emerald-700 font-bold' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <AnimatePresence>
                    {dateRange === 'personalizado' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm overflow-hidden"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Início</span>
                          <input 
                            type="date" 
                            value={customDates.start}
                            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                            className="text-xs font-bold text-gray-600 border-none p-0 focus:ring-0 bg-transparent cursor-pointer"
                          />
                        </div>
                        <div className="h-8 w-px bg-gray-100" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fim</span>
                          <input 
                            type="date" 
                            value={customDates.end}
                            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                            className="text-xs font-bold text-gray-600 border-none p-0 focus:ring-0 bg-transparent cursor-pointer"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Users size={24} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Total de Clientes</p>
                  <p className="text-4xl font-light mt-1">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <Car size={24} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Veículos</p>
                  <p className="text-4xl font-light mt-1">{stats?.totalVehicles || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <Wrench size={24} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Serviços</p>
                  <p className="text-4xl font-light mt-1">{stats?.totalServices || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                      <Bell size={24} />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Lembretes</p>
                  <p className="text-4xl font-light mt-1">{stats?.pendingReminders.length || 0}</p>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reminders Column */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Bell className="text-orange-500" size={20} />
                      Próximos Lembretes
                    </h3>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">Ver todos</button>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-black/5 bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Data</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {stats?.pendingReminders.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                Nenhum lembrete pendente.
                              </td>
                            </tr>
                          ) : (
                            stats?.pendingReminders.slice(0, 5).map((reminder) => (
                              <tr key={reminder.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="font-medium">{reminder.customer_name}</div>
                                  <div className="text-xs text-gray-400">{reminder.model}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-orange-600 font-medium">
                                    {new Date(reminder.next_maintenance_date).toLocaleDateString('pt-BR')}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => sendWhatsApp(reminder)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                    title="Lembrar via WhatsApp"
                                  >
                                    <MessageSquare size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Recent Services Column */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Wrench className="text-blue-500" size={20} />
                      Serviços Recentes
                    </h3>
                    <button 
                      onClick={() => setActiveTab('services')}
                      className="text-sm text-emerald-600 font-medium hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-black/5 bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Veículo</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Serviço</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {stats?.recentServices.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                                Nenhum serviço registrado.
                              </td>
                            </tr>
                          ) : (
                            stats?.recentServices.map((service) => (
                              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-medium">{service.model}</div>
                                  <div className="text-xs text-gray-400">{service.plate}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium">{service.service_type}</div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(service.date).toLocaleDateString('pt-BR')}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-emerald-600">
                                    R$ {service.price.toLocaleString('pt-BR')}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <CustomersView 
              customers={customers} 
              onRefresh={() => { fetchCustomers(); fetchStats(); }} 
            />
          )}

          {activeTab === 'services' && (
            <ServicesView 
              customers={customers}
              maintenanceTypes={maintenanceTypes}
              onRefresh={() => { fetchStats(); }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView maintenanceTypes={maintenanceTypes} onRefresh={fetchMaintenanceTypes} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ReportsView() {
  const [data, setData] = useState<{ month: string, total: number }[]>([]);

  useEffect(() => {
    fetch('/api/reports/revenue').then(res => res.json()).then(setData);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-3xl font-bold">Relatórios</h2>
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Faturamento Mensal (Últimos 6 meses)</h3>
        <div className="space-y-4">
          {data.map(item => (
            <div key={item.month} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-500">{item.month}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${Math.min(100, (item.total / (Math.max(...data.map(d => d.total)) || 1)) * 100)}%` }}
                />
              </div>
              <div className="w-32 text-right font-bold">R$ {item.total.toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SettingsView({ maintenanceTypes, onRefresh }: { maintenanceTypes: MaintenanceType[], onRefresh: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-3xl font-bold">Configurações</h2>
      <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Intervalos Padrão de Manutenção</h3>
        <div className="space-y-4">
          {maintenanceTypes.map(type => (
            <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="font-bold">{type.name}</div>
              <div className="flex gap-6 text-sm text-gray-500">
                <span>{type.default_km_interval} km</span>
                <span>{type.default_month_interval} meses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CustomersView({ customers, onRefresh }: { customers: Customer[], onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', phone: '', email: '' });
    setShowAdd(false);
    onRefresh();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-gray-500 mt-1">Gerencie os clientes da sua oficina</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-black/5 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-black/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Telefone</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Desde</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="font-bold">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-300 hover:text-emerald-600 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6">Cadastrar Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp / Telefone</label>
                <input 
                  required
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">E-mail (Opcional)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  placeholder="joao@email.com"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ServicesView({ customers, maintenanceTypes, onRefresh }: { customers: Customer[], maintenanceTypes: MaintenanceType[], onRefresh: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [serviceData, setServiceData] = useState({
    maintenance_type_id: '',
    service_type: 'Troca de Óleo',
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    price: '',
    notes: '',
    next_maintenance_date: '',
    next_maintenance_mileage: ''
  });

  const handleTypeChange = (typeId: string) => {
    const type = maintenanceTypes.find(t => t.id === parseInt(typeId));
    if (type) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + type.default_month_interval);
      
      setServiceData({
        ...serviceData,
        maintenance_type_id: typeId,
        service_type: type.name,
        next_maintenance_date: nextDate.toISOString().split('T')[0],
        next_maintenance_mileage: serviceData.mileage ? (parseInt(serviceData.mileage) + type.default_km_interval).toString() : ''
      });
    }
  };

  const [vehicleData, setVehicleData] = useState({
    plate: '',
    model: '',
    make: '',
    year: '',
    last_mileage: ''
  });

  const fetchVehicles = async (customerId: number) => {
    const res = await fetch(`/api/customers/${customerId}/vehicles`);
    const data = await res.json();
    setVehicles(data);
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicleData, customer_id: selectedCustomer.id })
    });
    const data = await res.json();
    await fetchVehicles(selectedCustomer.id);
    setStep(2);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...serviceData, vehicle_id: selectedVehicle.id })
    });
    alert('Serviço registrado com sucesso! O lembrete foi agendado.');
    setStep(1);
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    onRefresh();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-black/5 rounded-full">
            <ArrowLeft size={24} />
          </button>
        )}
        <h2 className="text-3xl font-bold tracking-tight">Registrar Novo Serviço</h2>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-emerald-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">1. Selecione o Cliente</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar cliente por nome ou telefone..."
              className="w-full bg-gray-50 border border-black/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {customers.map(c => (
              <button 
                key={c.id}
                onClick={() => { setSelectedCustomer(c); fetchVehicles(c.id); setStep(2); }}
                className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all text-left group"
              >
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.phone}</div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedCustomer && (
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">2. Selecione o Veículo de {selectedCustomer.name}</h3>
            <button 
              onClick={() => setStep(4)} // Step 4 will be "New Vehicle"
              className="text-emerald-600 font-bold text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Novo Veículo
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Nenhum veículo cadastrado para este cliente.</div>
            ) : (
              vehicles.map(v => (
                <button 
                  key={v.id}
                  onClick={() => { setSelectedVehicle(v); setStep(3); }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <Car size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-bold">{v.model} - {v.plate}</div>
                      <div className="text-sm text-gray-500">{v.make} {v.year} • {v.last_mileage} km</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === 4 && selectedCustomer && (
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Cadastrar Novo Veículo</h3>
          <form onSubmit={handleCreateVehicle} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Placa</label>
              <input required type="text" value={vehicleData.plate} onChange={e => setVehicleData({...vehicleData, plate: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="ABC-1234" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Modelo</label>
              <input required type="text" value={vehicleData.model} onChange={e => setVehicleData({...vehicleData, model: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="Ex: Corolla" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Marca</label>
              <input type="text" value={vehicleData.make} onChange={e => setVehicleData({...vehicleData, make: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="Ex: Toyota" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ano</label>
              <input type="number" value={vehicleData.year} onChange={e => setVehicleData({...vehicleData, year: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="2022" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quilometragem Atual</label>
              <input required type="number" value={vehicleData.last_mileage} onChange={e => setVehicleData({...vehicleData, last_mileage: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="0" />
            </div>
            <button type="submit" className="col-span-2 bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 mt-4">Salvar Veículo</button>
          </form>
        </div>
      )}

      {step === 3 && selectedVehicle && (
        <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <Car className="text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-900">{selectedVehicle.model} • {selectedVehicle.plate}</div>
              <div className="text-xs text-emerald-700">Cliente: {selectedCustomer?.name}</div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold">3. Detalhes do Serviço</h3>
          <form onSubmit={handleCreateService} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Serviço</label>
              <select 
                value={serviceData.maintenance_type_id} 
                onChange={e => handleTypeChange(e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3"
              >
                <option value="">Selecione um tipo...</option>
                {maintenanceTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                <option value="custom">Outro (Personalizado)</option>
              </select>
            </div>
            {serviceData.maintenance_type_id === 'custom' && (
              <div className="col-span-2">
                <input 
                  type="text" 
                  placeholder="Nome do serviço personalizado"
                  value={serviceData.service_type}
                  onChange={e => setServiceData({...serviceData, service_type: e.target.value})}
                  className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data do Serviço</label>
              <input required type="date" value={serviceData.date} onChange={e => setServiceData({...serviceData, date: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">KM Atual</label>
              <input required type="number" value={serviceData.mileage} onChange={e => setServiceData({...serviceData, mileage: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor do Serviço (R$)</label>
              <input required type="number" step="0.01" value={serviceData.price} onChange={e => setServiceData({...serviceData, price: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 font-bold text-emerald-600" placeholder="0,00" />
            </div>
            
            <div className="col-span-2 pt-4 border-t border-black/5">
              <h4 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Bell size={16} /> Configurar Lembrete Preventivo
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Próxima Data (Lembrete)</label>
                  <input required type="date" value={serviceData.next_maintenance_date} onChange={e => setServiceData({...serviceData, next_maintenance_date: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Próxima KM (Opcional)</label>
                  <input type="number" value={serviceData.next_maintenance_mileage} onChange={e => setServiceData({...serviceData, next_maintenance_mileage: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3" placeholder="Ex: 50000" />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observações</label>
              <textarea value={serviceData.notes} onChange={e => setServiceData({...serviceData, notes: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 h-24" placeholder="Detalhes do que foi feito..." />
            </div>

            <button type="submit" className="col-span-2 bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 mt-4">Finalizar e Agendar Lembrete</button>
          </form>
        </div>
      )}
    </motion.div>
  );
}

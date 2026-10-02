import {
  Workshop,
  Profile,
  Client,
  MeasurementType,
  MeasurementProfile,
  GarmentType,
  Order,
  Payment,
  Appointment,
  MessageTemplate,
  Note,
  ActivityLog,
  OrderStatus,
  OrderStatusHistory,
} from '@/types';
import {
  INITIAL_WORKSHOP,
  INITIAL_PROFILE,
  INITIAL_CLIENTS,
  INITIAL_GARMENT_TYPES,
  INITIAL_MEASUREMENT_TYPES,
  INITIAL_MEASUREMENT_PROFILES,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_NOTES,
  INITIAL_LOGS,
} from './mock-data';

// Helper pour persister les états de test dans le localStorage (côté client)
const STORAGE_PREFIX = 'couturier_app_data_';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Couche de données unifiée
class DataStore {
  private workshop: Workshop = INITIAL_WORKSHOP;
  private currentProfile: Profile = INITIAL_PROFILE;
  private clients: Client[] = INITIAL_CLIENTS;
  private garmentTypes: GarmentType[] = INITIAL_GARMENT_TYPES;
  private measurementTypes: MeasurementType[] = INITIAL_MEASUREMENT_TYPES;
  private measurementProfiles: MeasurementProfile[] = INITIAL_MEASUREMENT_PROFILES;
  private orders: Order[] = INITIAL_ORDERS;
  private payments: Payment[] = INITIAL_PAYMENTS;
  private appointments: Appointment[] = INITIAL_APPOINTMENTS;
  private messageTemplates: MessageTemplate[] = INITIAL_MESSAGE_TEMPLATES;
  private notes: Note[] = INITIAL_NOTES;
  private logs: ActivityLog[] = INITIAL_LOGS;
  private statusHistory: OrderStatusHistory[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      this.workshop = loadFromStorage('workshop', this.workshop);
      if (
        this.workshop.name === 'Atelier Couture Élégance Africaine' ||
        this.workshop.name === 'Atelier Couture Elégance Africaine'
      ) {
        this.workshop.name = 'Couturier';
        this.workshop.email = 'contact@couturier.bj';
        saveToStorage('workshop', this.workshop);
      }
      this.currentProfile = loadFromStorage('profile', this.currentProfile);
      this.clients = loadFromStorage('clients', this.clients);
      this.garmentTypes = loadFromStorage('garmentTypes', this.garmentTypes);
      this.measurementTypes = loadFromStorage('measurementTypes', this.measurementTypes);
      this.measurementProfiles = loadFromStorage('measurementProfiles', this.measurementProfiles);
      this.orders = loadFromStorage('orders', this.orders);
      this.payments = loadFromStorage('payments', this.payments);
      this.appointments = loadFromStorage('appointments', this.appointments);
      this.messageTemplates = loadFromStorage('messageTemplates', this.messageTemplates);
      this.notes = loadFromStorage('notes', this.notes);
      this.logs = loadFromStorage('logs', this.logs);
      this.statusHistory = loadFromStorage('statusHistory', this.statusHistory);
    }
  }

  // --- WORKSHOP & PROFILE ---
  getWorkshop(): Workshop {
    return this.workshop;
  }

  updateWorkshop(updates: Partial<Workshop>): Workshop {
    this.workshop = { ...this.workshop, ...updates, updated_at: new Date().toISOString() };
    saveToStorage('workshop', this.workshop);
    return this.workshop;
  }

  getCurrentProfile(): Profile {
    return this.currentProfile;
  }

  updateCurrentProfile(updates: Partial<Profile>): Profile {
    this.currentProfile = { ...this.currentProfile, ...updates, updated_at: new Date().toISOString() };
    saveToStorage('profile', this.currentProfile);
    return this.currentProfile;
  }

  // --- CLIENTS ---
  getClients(filterArchived: boolean = false): Client[] {
    return this.clients
      .filter((c) => c.workshop_id === this.workshop.id && !c.deleted_at)
      .filter((c) => (filterArchived ? !!c.archived_at : !c.archived_at))
      .sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
  }

  getClientById(id: string): Client | undefined {
    return this.clients.find(
      (c) => c.id === id && c.workshop_id === this.workshop.id && !c.deleted_at
    );
  }

  searchClients(query: string): Client[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getClients();
    return this.clients
      .filter((c) => c.workshop_id === this.workshop.id && !c.deleted_at)
      .filter(
        (c) =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.whatsapp && c.whatsapp.includes(q))
      );
  }

  createClient(
    clientData: Omit<Client, 'id' | 'workshop_id' | 'created_at' | 'updated_at' | 'last_activity_at'>
  ): Client {
    const newClient: Client = {
      ...clientData,
      id: 'cl-' + Date.now(),
      workshop_id: this.workshop.id,
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    saveToStorage('clients', this.clients);
    this.logActivity('clients', newClient.id, 'client_created', { name: `${newClient.first_name} ${newClient.last_name}` });
    return newClient;
  }

  updateClient(id: string, updates: Partial<Client>): Client {
    const index = this.clients.findIndex((c) => c.id === id && c.workshop_id === this.workshop.id);
    if (index === -1) throw new Error('Client introuvable');
    this.clients[index] = {
      ...this.clients[index],
      ...updates,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveToStorage('clients', this.clients);
    this.logActivity('clients', id, 'client_updated', updates);
    return this.clients[index];
  }

  archiveClient(id: string, archive: boolean = true): Client {
    return this.updateClient(id, {
      archived_at: archive ? new Date().toISOString() : null,
    });
  }

  softDeleteClient(id: string): void {
    const client = this.getClientById(id);
    if (!client) throw new Error('Client introuvable');
    this.updateClient(id, { deleted_at: new Date().toISOString() });
    this.logActivity('clients', id, 'client_deleted', { name: `${client.first_name} ${client.last_name}` });
  }

  // --- MEASUREMENT TYPES ---
  getMeasurementTypes(): MeasurementType[] {
    return this.measurementTypes
      .filter((mt) => mt.workshop_id === this.workshop.id && mt.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  getMeasurementTypesByGender(gender: 'm' | 'f'): MeasurementType[] {
    return this.getMeasurementTypes().filter(
      (mt) => mt.gender === gender || mt.gender === 'both'
    );
  }

  createMeasurementType(type: Omit<MeasurementType, 'id' | 'workshop_id'>): MeasurementType {
    const newType: MeasurementType = {
      ...type,
      id: 'mt-' + Date.now(),
      workshop_id: this.workshop.id,
    };
    this.measurementTypes.push(newType);
    saveToStorage('measurementTypes', this.measurementTypes);
    return newType;
  }

  updateMeasurementType(id: string, updates: Partial<MeasurementType>): MeasurementType {
    const index = this.measurementTypes.findIndex((mt) => mt.id === id && mt.workshop_id === this.workshop.id);
    if (index === -1) throw new Error('Type de mesure introuvable');
    this.measurementTypes[index] = { ...this.measurementTypes[index], ...updates };
    saveToStorage('measurementTypes', this.measurementTypes);
    return this.measurementTypes[index];
  }

  // --- MEASUREMENT PROFILES (RÈGLES 2 & 4 : IMMUABILITÉ & VERSIONS) ---
  getMeasurementProfilesByClient(clientId: string): MeasurementProfile[] {
    return this.measurementProfiles
      .filter((mp) => mp.client_id === clientId && mp.workshop_id === this.workshop.id)
      .sort((a, b) => b.version - a.version);
  }

  getMeasurementProfileById(id: string): MeasurementProfile | undefined {
    return this.measurementProfiles.find(
      (mp) => mp.id === id && mp.workshop_id === this.workshop.id
    );
  }

  isMeasurementProfileImmutable(profileId: string): boolean {
    return this.orders.some((o) => o.measurement_profile_id === profileId && !o.deleted_at);
  }

  createMeasurementProfileVersion(
    clientId: string,
    measurements: Record<string, number>,
    notes?: string,
    kind: 'standard' | 'custom' = 'standard',
    parentId?: string | null
  ): MeasurementProfile {
    const existing = this.getMeasurementProfilesByClient(clientId);
    const nextVersion = existing.length > 0 ? Math.max(...existing.map((e) => e.version)) + 1 : 1;

    const newProfile: MeasurementProfile = {
      id: 'mp-' + Date.now(),
      workshop_id: this.workshop.id,
      client_id: clientId,
      version: nextVersion,
      kind,
      parent_id: parentId || null,
      taken_at: new Date().toISOString(),
      notes: notes || null,
      created_by: this.currentProfile.id,
      created_at: new Date().toISOString(),
      measurements,
    };

    this.measurementProfiles.unshift(newProfile);
    saveToStorage('measurementProfiles', this.measurementProfiles);

    // Mettre à jour last_activity du client
    this.updateClient(clientId, {});
    this.logActivity('measurement_profiles', newProfile.id, 'profile_created', {
      version: nextVersion,
      client_id: clientId,
      kind,
    });

    return newProfile;
  }

  // Règle 2 : Jamais d'UPDATE direct si référencé par une commande !
  updateMeasurementProfile(id: string, updates: Partial<MeasurementProfile>): MeasurementProfile {
    if (this.isMeasurementProfileImmutable(id)) {
      throw new Error(
        'RÈGLE FONDAMENTALE : Ce profil de mensurations est lié à une commande et est strictement IMMUABLE. Veuillez créer une nouvelle version (n+1).'
      );
    }
    const idx = this.measurementProfiles.findIndex((mp) => mp.id === id);
    if (idx === -1) throw new Error('Profil introuvable');
    this.measurementProfiles[idx] = { ...this.measurementProfiles[idx], ...updates };
    saveToStorage('measurementProfiles', this.measurementProfiles);
    return this.measurementProfiles[idx];
  }

  // --- GARMENT TYPES ---
  getGarmentTypes(): GarmentType[] {
    return this.garmentTypes.filter((gt) => gt.workshop_id === this.workshop.id);
  }

  createGarmentType(name: string): GarmentType {
    const newGt: GarmentType = {
      id: 'gt-' + Date.now(),
      workshop_id: this.workshop.id,
      name,
      created_at: new Date().toISOString(),
    };
    this.garmentTypes.push(newGt);
    saveToStorage('garmentTypes', this.garmentTypes);
    return newGt;
  }

  // --- ORDERS & COMPUTED FIELDS (RÈGLE 6 & 7 : EN RETARD CALCULÉ & TOTAL_PAYÉ EN VUE) ---
  private enrichOrder(order: Order): Order {
    const client = this.getClientById(order.client_id);
    const garment_type = this.garmentTypes.find((gt) => gt.id === order.garment_type_id);

    const orderPayments = this.payments.filter(
      (p) => p.order_id === order.id && !p.deleted_at
    );
    const total_paid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, order.price - total_paid);
    const percent_paid =
      order.price > 0 ? Math.min(100, Math.round((total_paid / order.price) * 100)) : 100;

    const dueDateObj = new Date(order.due_date);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);
    const is_overdue =
      dueDateObj < todayObj && order.status !== 'livree' && order.status !== 'annulee';

    return {
      ...order,
      client,
      garment_type,
      total_paid,
      remaining,
      percent_paid,
      is_overdue,
    };
  }

  getOrders(): Order[] {
    return this.orders
      .filter((o) => o.workshop_id === this.workshop.id && !o.deleted_at)
      .map((o) => this.enrichOrder(o))
      .sort((a, b) => b.number - a.number);
  }

  getOrderById(id: string): Order | undefined {
    const order = this.orders.find(
      (o) => o.id === id && o.workshop_id === this.workshop.id && !o.deleted_at
    );
    return order ? this.enrichOrder(order) : undefined;
  }

  getOrdersByClient(clientId: string): Order[] {
    return this.getOrders().filter((o) => o.client_id === clientId);
  }

  createOrder(
    orderData: Omit<
      Order,
      'id' | 'workshop_id' | 'number' | 'created_at' | 'updated_at' | 'total_paid' | 'remaining' | 'percent_paid' | 'is_overdue'
    >
  ): Order {
    // Séquence automatique par atelier
    const maxNum = this.orders
      .filter((o) => o.workshop_id === this.workshop.id)
      .reduce((max, o) => Math.max(max, o.number), 0);
    const nextNumber = maxNum + 1;

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      workshop_id: this.workshop.id,
      number: nextNumber,
      price: Math.round(orderData.price),
      quantity: orderData.quantity || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    saveToStorage('orders', this.orders);

    // Enregistrer l'historique du statut initial
    this.addStatusHistory(newOrder.id, null, newOrder.status);

    // Mettre à jour l'activité du client
    this.updateClient(newOrder.client_id, {});
    this.logActivity('orders', newOrder.id, 'order_created', {
      number: nextNumber,
      client_id: newOrder.client_id,
      price: newOrder.price,
    });

    return this.enrichOrder(newOrder);
  }

  updateOrderStatus(orderId: string, toStatus: OrderStatus): Order {
    const index = this.orders.findIndex((o) => o.id === orderId && o.workshop_id === this.workshop.id);
    if (index === -1) throw new Error('Commande introuvable');

    const fromStatus = this.orders[index].status;
    if (fromStatus === toStatus) return this.enrichOrder(this.orders[index]);

    this.orders[index] = {
      ...this.orders[index],
      status: toStatus,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('orders', this.orders);

    this.addStatusHistory(orderId, fromStatus, toStatus);
    this.logActivity('orders', orderId, 'status_updated', { from: fromStatus, to: toStatus });

    return this.enrichOrder(this.orders[index]);
  }

  updateOrder(orderId: string, updates: Partial<Order>): Order {
    const index = this.orders.findIndex((o) => o.id === orderId && o.workshop_id === this.workshop.id);
    if (index === -1) throw new Error('Commande introuvable');

    const oldStatus = this.orders[index].status;
    this.orders[index] = {
      ...this.orders[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('orders', this.orders);

    if (updates.status && updates.status !== oldStatus) {
      this.addStatusHistory(orderId, oldStatus, updates.status);
    }

    return this.enrichOrder(this.orders[index]);
  }

  softDeleteOrder(orderId: string): void {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Commande introuvable');
    this.updateOrder(orderId, { deleted_at: new Date().toISOString() });
    this.logActivity('orders', orderId, 'order_deleted', { number: order.number });
  }

  private addStatusHistory(orderId: string, fromStatus: OrderStatus | null, toStatus: OrderStatus) {
    const historyItem: OrderStatusHistory = {
      id: 'osh-' + Date.now(),
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: this.currentProfile.id,
      changed_by_name: this.currentProfile.full_name,
      changed_at: new Date().toISOString(),
    };
    this.statusHistory.unshift(historyItem);
    saveToStorage('statusHistory', this.statusHistory);
  }

  getOrderStatusHistory(orderId: string): OrderStatusHistory[] {
    return this.statusHistory.filter((h) => h.order_id === orderId);
  }

  // --- PAYMENTS ---
  getPayments(): Payment[] {
    return this.payments
      .filter((p) => p.workshop_id === this.workshop.id && !p.deleted_at)
      .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  }

  getPaymentsByOrder(orderId: string): Payment[] {
    return this.payments
      .filter((p) => p.order_id === orderId && !p.deleted_at)
      .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  }

  getPaymentsByClient(clientId: string): Payment[] {
    const clientOrderIds = new Set(this.getOrdersByClient(clientId).map((o) => o.id));
    return this.payments.filter((p) => clientOrderIds.has(p.order_id) && !p.deleted_at);
  }

  createPayment(
    paymentData: Omit<Payment, 'id' | 'workshop_id' | 'created_at'>
  ): Payment {
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      workshop_id: this.workshop.id,
      amount: Math.round(paymentData.amount),
      created_by: this.currentProfile.id,
      created_at: new Date().toISOString(),
    };

    this.payments.unshift(newPayment);
    saveToStorage('payments', this.payments);

    // Mettre à jour l'activité du client via la commande
    const order = this.getOrderById(paymentData.order_id);
    if (order) {
      this.updateClient(order.client_id, {});
    }

    this.logActivity('payments', newPayment.id, 'payment_created', {
      order_id: newPayment.order_id,
      amount: newPayment.amount,
      method: newPayment.method,
    });

    return newPayment;
  }

  // --- APPOINTMENTS ---
  getAppointments(): Appointment[] {
    return this.appointments
      .filter((a) => a.workshop_id === this.workshop.id && !a.deleted_at)
      .map((a) => ({
        ...a,
        client: this.getClientById(a.client_id),
        order: a.order_id ? this.getOrderById(a.order_id) : undefined,
      }))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }

  getTodayAppointments(): Appointment[] {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.getAppointments().filter(
      (a) => a.starts_at.startsWith(todayStr) && a.status !== 'annule'
    );
  }

  getAppointmentsByClient(clientId: string): Appointment[] {
    return this.getAppointments().filter((a) => a.client_id === clientId);
  }

  createAppointment(
    apptData: Omit<Appointment, 'id' | 'workshop_id' | 'created_at' | 'updated_at'>
  ): Appointment {
    const newAppt: Appointment = {
      ...apptData,
      id: 'apt-' + Date.now(),
      workshop_id: this.workshop.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.appointments.push(newAppt);
    saveToStorage('appointments', this.appointments);

    this.updateClient(newAppt.client_id, {});
    this.logActivity('appointments', newAppt.id, 'appointment_created', {
      type: newAppt.type,
      starts_at: newAppt.starts_at,
    });

    return {
      ...newAppt,
      client: this.getClientById(newAppt.client_id),
      order: newAppt.order_id ? this.getOrderById(newAppt.order_id) : undefined,
    };
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment {
    const index = this.appointments.findIndex((a) => a.id === id && a.workshop_id === this.workshop.id);
    if (index === -1) throw new Error('Rendez-vous introuvable');

    this.appointments[index] = {
      ...this.appointments[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('appointments', this.appointments);

    return {
      ...this.appointments[index],
      client: this.getClientById(this.appointments[index].client_id),
      order: this.appointments[index].order_id
        ? this.getOrderById(this.appointments[index].order_id!)
        : undefined,
    };
  }

  // --- NOTES ---
  getNotesByClient(clientId: string): Note[] {
    return this.notes
      .filter((n) => n.client_id === clientId && n.workshop_id === this.workshop.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  createNote(clientId: string, body: string): Note {
    const newNote: Note = {
      id: 'nt-' + Date.now(),
      workshop_id: this.workshop.id,
      client_id: clientId,
      body,
      created_by: this.currentProfile.id,
      author_name: this.currentProfile.full_name,
      created_at: new Date().toISOString(),
    };
    this.notes.unshift(newNote);
    saveToStorage('notes', this.notes);
    this.updateClient(clientId, {});
    return newNote;
  }

  // --- ACTIVITY LOGS ---
  getActivityLogs(clientId?: string): ActivityLog[] {
    if (clientId) {
      return this.logs.filter(
        (l) =>
          l.workshop_id === this.workshop.id &&
          ((l.entity === 'clients' && l.entity_id === clientId) ||
            l.meta.client_id === clientId)
      );
    }
    return this.logs
      .filter((l) => l.workshop_id === this.workshop.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  logActivity(entity: string, entity_id: string, action: string, meta: Record<string, any> = {}) {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      workshop_id: this.workshop.id,
      entity,
      entity_id,
      action,
      meta,
      user_id: this.currentProfile.id,
      user_name: this.currentProfile.full_name,
      created_at: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    saveToStorage('logs', this.logs);
  }

  // --- MESSAGE TEMPLATES ---
  getMessageTemplates(): MessageTemplate[] {
    return this.messageTemplates.filter((mt) => mt.workshop_id === this.workshop.id);
  }

  getMessageTemplateByKey(key: 'rdv' | 'pret' | 'paiement'): MessageTemplate | undefined {
    return this.messageTemplates.find(
      (mt) => mt.workshop_id === this.workshop.id && mt.key === key
    );
  }

  updateMessageTemplate(key: 'rdv' | 'pret' | 'paiement', body: string): MessageTemplate {
    const idx = this.messageTemplates.findIndex(
      (mt) => mt.workshop_id === this.workshop.id && mt.key === key
    );
    if (idx === -1) {
      const newTmpl: MessageTemplate = {
        id: 'tmpl-' + Date.now(),
        workshop_id: this.workshop.id,
        key,
        body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.messageTemplates.push(newTmpl);
      saveToStorage('messageTemplates', this.messageTemplates);
      return newTmpl;
    }
    this.messageTemplates[idx] = {
      ...this.messageTemplates[idx],
      body,
      updated_at: new Date().toISOString(),
    };
    saveToStorage('messageTemplates', this.messageTemplates);
    return this.messageTemplates[idx];
  }

  // --- GLOBAL SEARCH ---
  globalSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { clients: [], orders: [], appointments: [] };

    const matchingClients = this.clients
      .filter((c) => c.workshop_id === this.workshop.id && !c.deleted_at)
      .filter(
        (c) =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      )
      .slice(0, 5);

    const matchingOrders = this.getOrders()
      .filter(
        (o) =>
          o.number.toString().includes(q) ||
          (o.model && o.model.toLowerCase().includes(q)) ||
          (o.fabric && o.fabric.toLowerCase().includes(q)) ||
          (o.client && `${o.client.first_name} ${o.client.last_name}`.toLowerCase().includes(q))
      )
      .slice(0, 5);

    const matchingAppointments = this.getAppointments()
      .filter(
        (a) =>
          (a.notes && a.notes.toLowerCase().includes(q)) ||
          (a.client && `${a.client.first_name} ${a.client.last_name}`.toLowerCase().includes(q))
      )
      .slice(0, 5);

    return {
      clients: matchingClients,
      orders: matchingOrders,
      appointments: matchingAppointments,
    };
  }

  // --- DASHBOARD AGGREGATES ---
  getDashboardStats() {
    const orders = this.getOrders();
    const payments = this.getPayments();
    const todayAppts = this.getTodayAppointments();

    const activeOrders = orders.filter((o) => o.status !== 'livree' && o.status !== 'annulee');
    const overdueOrders = activeOrders.filter((o) => o.is_overdue);
    const readyOrders = activeOrders.filter((o) => o.status === 'prete_a_livrer');

    const totalRemaining = activeOrders.reduce((sum, o) => sum + (o.remaining || 0), 0);

    // CA du mois en cours
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthPayments = payments.filter((p) => p.paid_at.startsWith(currentMonth));
    const currentMonthRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    // Graphique 1 : CA par mois (6 derniers mois)
    const revenueByMonthMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('fr-FR', { month: 'short' });
      revenueByMonthMap[key] = 0;
    }
    payments.forEach((p) => {
      const pDate = new Date(p.paid_at);
      const key = pDate.toLocaleDateString('fr-FR', { month: 'short' });
      if (revenueByMonthMap[key] !== undefined) {
        revenueByMonthMap[key] += p.amount;
      }
    });
    const revenueChartData = Object.entries(revenueByMonthMap).map(([month, ca]) => ({
      month,
      ca,
    }));

    // Graphique 2 : Commandes par type de vêtement
    const garmentCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const name = o.garment_type?.name || 'Autre';
      garmentCounts[name] = (garmentCounts[name] || 0) + 1;
    });
    const garmentChartData = Object.entries(garmentCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Graphique 3 : Répartition par statuts
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      todayAppointmentsCount: todayAppts.length,
      activeOrdersCount: activeOrders.length,
      readyOrdersCount: readyOrders.length,
      overdueOrdersCount: overdueOrders.length,
      currentMonthRevenue,
      totalRemaining,
      revenueChartData,
      garmentChartData,
      statusChartData,
      todayAppointments: todayAppts,
      overdueOrders,
    };
  }
}

// Instance globale singleton
export const dataStore = new DataStore();

import Dexie, { type Table } from 'dexie';
import {
  Client,
  MeasurementProfile,
  MeasurementValue,
  Order,
  Payment,
  Appointment,
} from '@/types';

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  operation: 'insert' | 'update' | 'delete';
  record_id: string;
  payload: any;
  created_at: string;
}

export class CouturierDatabase extends Dexie {
  clients!: Table<Client, string>;
  measurement_profiles!: Table<MeasurementProfile, string>;
  measurements!: Table<MeasurementValue, string>;
  orders!: Table<Order, string>;
  payments!: Table<Payment, string>;
  appointments!: Table<Appointment, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('CouturierOfflineDB');
    this.version(1).stores({
      clients: 'id, workshop_id, last_name, phone, archived_at, deleted_at, last_activity_at',
      measurement_profiles: 'id, workshop_id, client_id, version, kind, taken_at',
      measurements: 'id, profile_id, type_id',
      orders: 'id, workshop_id, number, client_id, status, due_date, deleted_at',
      payments: 'id, workshop_id, order_id, paid_at, deleted_at',
      appointments: 'id, workshop_id, client_id, starts_at, status, deleted_at',
      sync_queue: '++id, table_name, operation, record_id, created_at',
    });
  }
}

export const db = new CouturierDatabase();

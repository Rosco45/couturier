// Types TypeScript stricts pour Couturier PWA

export type UserRole = 'admin' | 'tailor' | 'assistant';

export interface AssistantPermissions {
  can_manage_clients?: boolean;
  can_manage_measurements?: boolean;
  can_manage_orders?: boolean;
  can_manage_appointments?: boolean;
  can_manage_payments?: boolean;
  can_view_reports?: boolean;
  can_manage_settings?: boolean;
}

export interface Workshop {
  id: string;
  name: string;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  currency: string; // 'FCFA'
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  workshop_id: string;
  full_name: string;
  role: UserRole;
  permissions: AssistantPermissions;
  created_at: string;
  updated_at: string;
}

export type Gender = 'm' | 'f';
export type MeasurementGender = 'm' | 'f' | 'both';

export interface Client {
  id: string;
  workshop_id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  photo_url?: string | null;
  profession?: string | null;
  notes?: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementType {
  id: string;
  workshop_id: string;
  name: string;
  gender: MeasurementGender;
  category: 'haut' | 'bas' | 'robe' | 'boubou' | 'autre';
  unit: string; // 'cm'
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MeasurementProfile {
  id: string;
  workshop_id: string;
  client_id: string;
  version: number;
  kind: 'standard' | 'custom';
  parent_id?: string | null;
  taken_at: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  measurements?: Record<string, number>; // type_id -> value
}

export interface MeasurementValue {
  id?: string;
  profile_id: string;
  type_id: string;
  value: number;
  measurement_type?: MeasurementType;
}

export interface GarmentType {
  id: string;
  workshop_id: string;
  name: string;
  created_at?: string;
}

export type OrderStatus =
  | 'nouvelle'
  | 'en_attente'
  | 'tissu_recu'
  | 'en_confection'
  | 'essayage'
  | 'retouche'
  | 'terminee'
  | 'prete_a_livrer'
  | 'livree'
  | 'annulee';

export interface Order {
  id: string;
  workshop_id: string;
  number: number;
  client_id: string;
  garment_type_id: string;
  model?: string | null;
  description?: string | null;
  color?: string | null;
  fabric?: string | null;
  quantity: number;
  price: number; // Entier en FCFA
  due_date: string;
  status: OrderStatus;
  assigned_to?: string | null;
  measurement_profile_id: string;
  notes?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  // Champs calculés ou joints
  client?: Client;
  garment_type?: GarmentType;
  total_paid?: number;
  remaining?: number;
  percent_paid?: number;
  is_overdue?: boolean;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  changed_by?: string | null;
  changed_by_name?: string | null;
  changed_at: string;
}

export type PaymentMethod =
  | 'especes'
  | 'mtn_momo'
  | 'moov_money'
  | 'virement'
  | 'carte'
  | 'autre';

export interface Payment {
  id: string;
  workshop_id: string;
  order_id: string;
  amount: number; // Entier en FCFA
  paid_at: string;
  method: PaymentMethod;
  reference?: string | null;
  comment?: string | null;
  created_by?: string | null;
  deleted_at?: string | null;
  created_at: string;
  order?: Order;
}

export type AppointmentType =
  | 'mesures'
  | 'essayage'
  | 'retouche'
  | 'livraison'
  | 'recuperation'
  | 'consultation'
  | 'autre';

export type AppointmentStatus =
  | 'programme'
  | 'confirme'
  | 'honore'
  | 'annule'
  | 'absent';

export interface Appointment {
  id: string;
  workshop_id: string;
  client_id: string;
  order_id?: string | null;
  starts_at: string;
  duration_min: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  order?: Order;
}

export type PhotoKind =
  | 'modele'
  | 'tissu'
  | 'croquis'
  | 'inspiration'
  | 'confection'
  | 'final';

export interface Photo {
  id: string;
  workshop_id: string;
  client_id?: string | null;
  order_id?: string | null;
  kind: PhotoKind;
  storage_path: string;
  url?: string;
  created_at: string;
}

export interface Note {
  id: string;
  workshop_id: string;
  client_id: string;
  body: string;
  created_by?: string | null;
  created_at: string;
  author_name?: string;
}

export interface ActivityLog {
  id: string;
  workshop_id: string;
  entity: string;
  entity_id: string;
  action: string;
  meta: Record<string, any>;
  user_id?: string | null;
  user_name?: string | null;
  created_at: string;
}

export type MessageTemplateKey = 'rdv' | 'pret' | 'paiement';

export interface MessageTemplate {
  id: string;
  workshop_id: string;
  key: MessageTemplateKey;
  body: string;
  created_at?: string;
  updated_at?: string;
}

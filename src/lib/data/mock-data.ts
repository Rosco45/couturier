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
  ActivityLog
} from '@/types';

export const INITIAL_WORKSHOP: Workshop = {
  id: 'ws-benin-01',
  name: 'Atelier Couture Élégance Africaine',
  logo_url: null,
  address: 'Avenue Jean-Paul II, Haie Vive, Cotonou, Bénin',
  phone: '+229 97 00 11 22',
  whatsapp: '+22997001122',
  email: 'contact@couture-elegance.bj',
  currency: 'FCFA',
  created_at: new Date('2026-01-01').toISOString(),
  updated_at: new Date('2026-01-01').toISOString(),
};

export const INITIAL_PROFILE: Profile = {
  id: 'user-01',
  workshop_id: INITIAL_WORKSHOP.id,
  full_name: 'Maître Koffi Mensah',
  role: 'admin',
  permissions: {
    can_manage_clients: true,
    can_manage_measurements: true,
    can_manage_orders: true,
    can_manage_appointments: true,
    can_manage_payments: true,
    can_view_reports: true,
    can_manage_settings: true,
  },
  created_at: new Date('2026-01-01').toISOString(),
  updated_at: new Date('2026-01-01').toISOString(),
};

export const INITIAL_GARMENT_TYPES: GarmentType[] = [
  { id: 'gt-1', workshop_id: INITIAL_WORKSHOP.id, name: 'Grand Boubou Brodé' },
  { id: 'gt-2', workshop_id: INITIAL_WORKSHOP.id, name: 'Ensemble Pagne 3 pièces' },
  { id: 'gt-3', workshop_id: INITIAL_WORKSHOP.id, name: 'Costume / Veste Homme' },
  { id: 'gt-4', workshop_id: INITIAL_WORKSHOP.id, name: 'Chemise Col Mao / Wax' },
  { id: 'gt-5', workshop_id: INITIAL_WORKSHOP.id, name: 'Pantalon Sur Mesure' },
  { id: 'gt-6', workshop_id: INITIAL_WORKSHOP.id, name: 'Robe de Soirée Évasée' },
  { id: 'gt-7', workshop_id: INITIAL_WORKSHOP.id, name: 'Kaba Moderne' },
  { id: 'gt-8', workshop_id: INITIAL_WORKSHOP.id, name: 'Tunique Africaine' },
];

export const INITIAL_MEASUREMENT_TYPES: MeasurementType[] = [
  // Homme
  { id: 'mt-h-1', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de cou', gender: 'm', category: 'haut', unit: 'cm', display_order: 1, is_active: true },
  { id: 'mt-h-2', workshop_id: INITIAL_WORKSHOP.id, name: 'Carrure dos', gender: 'm', category: 'haut', unit: 'cm', display_order: 2, is_active: true },
  { id: 'mt-h-3', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de poitrine', gender: 'm', category: 'haut', unit: 'cm', display_order: 3, is_active: true },
  { id: 'mt-h-4', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de taille', gender: 'm', category: 'haut', unit: 'cm', display_order: 4, is_active: true },
  { id: 'mt-h-5', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur dos / veste', gender: 'm', category: 'haut', unit: 'cm', display_order: 5, is_active: true },
  { id: 'mt-h-6', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur manche courte', gender: 'm', category: 'haut', unit: 'cm', display_order: 6, is_active: true },
  { id: 'mt-h-7', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur manche longue', gender: 'm', category: 'haut', unit: 'cm', display_order: 7, is_active: true },
  { id: 'mt-h-8', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de bras (biceps)', gender: 'm', category: 'haut', unit: 'cm', display_order: 8, is_active: true },
  { id: 'mt-h-9', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de poignet', gender: 'm', category: 'haut', unit: 'cm', display_order: 9, is_active: true },
  { id: 'mt-h-10', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de ceinture', gender: 'm', category: 'bas', unit: 'cm', display_order: 10, is_active: true },
  { id: 'mt-h-11', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de bassin', gender: 'm', category: 'bas', unit: 'cm', display_order: 11, is_active: true },
  { id: 'mt-h-12', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur pantalon', gender: 'm', category: 'bas', unit: 'cm', display_order: 12, is_active: true },
  { id: 'mt-h-13', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur entrejambe', gender: 'm', category: 'bas', unit: 'cm', display_order: 13, is_active: true },
  { id: 'mt-h-14', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de cuisse', gender: 'm', category: 'bas', unit: 'cm', display_order: 14, is_active: true },
  { id: 'mt-h-15', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de genou', gender: 'm', category: 'bas', unit: 'cm', display_order: 15, is_active: true },
  { id: 'mt-h-16', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour bas pantalon', gender: 'm', category: 'bas', unit: 'cm', display_order: 16, is_active: true },
  { id: 'mt-h-17', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur grand boubou', gender: 'm', category: 'boubou', unit: 'cm', display_order: 17, is_active: true },
  
  // Femme
  { id: 'mt-f-1', workshop_id: INITIAL_WORKSHOP.id, name: 'Carrure dos', gender: 'f', category: 'haut', unit: 'cm', display_order: 1, is_active: true },
  { id: 'mt-f-2', workshop_id: INITIAL_WORKSHOP.id, name: 'Carrure devant', gender: 'f', category: 'haut', unit: 'cm', display_order: 2, is_active: true },
  { id: 'mt-f-3', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de poitrine', gender: 'f', category: 'haut', unit: 'cm', display_order: 3, is_active: true },
  { id: 'mt-f-4', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de sous-poitrine', gender: 'f', category: 'haut', unit: 'cm', display_order: 4, is_active: true },
  { id: 'mt-f-5', workshop_id: INITIAL_WORKSHOP.id, name: 'Écart de poitrine', gender: 'f', category: 'haut', unit: 'cm', display_order: 5, is_active: true },
  { id: 'mt-f-6', workshop_id: INITIAL_WORKSHOP.id, name: 'Hauteur de poitrine', gender: 'f', category: 'haut', unit: 'cm', display_order: 6, is_active: true },
  { id: 'mt-f-7', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de taille', gender: 'f', category: 'haut', unit: 'cm', display_order: 7, is_active: true },
  { id: 'mt-f-8', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur épaule-taille', gender: 'f', category: 'haut', unit: 'cm', display_order: 8, is_active: true },
  { id: 'mt-f-9', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de bassin / hanches', gender: 'f', category: 'bas', unit: 'cm', display_order: 9, is_active: true },
  { id: 'mt-f-10', workshop_id: INITIAL_WORKSHOP.id, name: 'Hauteur hanches', gender: 'f', category: 'bas', unit: 'cm', display_order: 10, is_active: true },
  { id: 'mt-f-11', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur robe', gender: 'f', category: 'robe', unit: 'cm', display_order: 11, is_active: true },
  { id: 'mt-f-12', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur jupe', gender: 'f', category: 'bas', unit: 'cm', display_order: 12, is_active: true },
  { id: 'mt-f-13', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur taille-sol', gender: 'f', category: 'bas', unit: 'cm', display_order: 13, is_active: true },
  { id: 'mt-f-14', workshop_id: INITIAL_WORKSHOP.id, name: 'Longueur manche', gender: 'f', category: 'haut', unit: 'cm', display_order: 14, is_active: true },
  { id: 'mt-f-15', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de bras', gender: 'f', category: 'haut', unit: 'cm', display_order: 15, is_active: true },
  { id: 'mt-f-16', workshop_id: INITIAL_WORKSHOP.id, name: 'Tour de poignet', gender: 'f', category: 'haut', unit: 'cm', display_order: 16, is_active: true },
];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    workshop_id: INITIAL_WORKSHOP.id,
    key: 'rdv',
    body: "Bonjour {prenom}, votre rendez-vous à l'atelier {atelier} est prévu le {date}. Nous vous attendons avec plaisir !",
  },
  {
    id: 'tmpl-2',
    workshop_id: INITIAL_WORKSHOP.id,
    key: 'pret',
    body: "Bonjour {prenom}, votre commande #{numero} est prête pour essayage et retrait à l'atelier {atelier} ! À très bientôt.",
  },
  {
    id: 'tmpl-3',
    workshop_id: INITIAL_WORKSHOP.id,
    key: 'paiement',
    body: "Bonjour {prenom}, nous confirmons la réception de votre paiement. Reste à solder pour la commande #{numero} : {reste} FCFA. Merci de votre confiance !",
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-1',
    workshop_id: INITIAL_WORKSHOP.id,
    first_name: 'Rodrigue',
    last_name: 'Agbessi',
    gender: 'm',
    birth_date: '1988-06-14',
    phone: '+229 97 45 67 89',
    whatsapp: '+22997456789',
    email: 'rodrigue.agbessi@gmail.com',
    address: 'Quartier Haie Vive, Cotonou',
    profession: 'Directeur Commercial',
    notes: 'Préfère les cols mao rigides et les finitions surpiquées.',
    last_activity_at: new Date().toISOString(),
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cl-2',
    workshop_id: INITIAL_WORKSHOP.id,
    first_name: 'Fifamè',
    last_name: 'Houessou',
    gender: 'f',
    birth_date: '1992-11-03',
    phone: '+229 96 78 90 12',
    whatsapp: '+22996789012',
    email: 'fifame.houessou@yahoo.fr',
    address: 'Quartier Ganhi, Cotonou',
    profession: 'Notaire',
    notes: 'Exige des coutures doublées pour les tenues de cérémonie.',
    last_activity_at: new Date().toISOString(),
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cl-3',
    workshop_id: INITIAL_WORKSHOP.id,
    first_name: 'Christian',
    last_name: 'Hounkpè',
    gender: 'm',
    birth_date: '1985-03-22',
    phone: '+229 90 11 22 33',
    whatsapp: '+22990112233',
    email: null,
    address: 'Akpakpa Dodomè, Cotonou',
    profession: 'Architecte',
    notes: 'Adore les tissus Bazin riche teinté et le lin lourd.',
    last_activity_at: new Date().toISOString(),
    created_at: new Date('2026-02-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cl-4',
    workshop_id: INITIAL_WORKSHOP.id,
    first_name: 'Reine',
    last_name: 'Dossou-Yovo',
    gender: 'f',
    birth_date: '1995-08-30',
    phone: '+229 94 33 22 11',
    whatsapp: '+22994332211',
    email: 'reine.dy@outlook.com',
    address: 'Cadjèhoun, Cotonou',
    profession: 'Médecin',
    notes: 'Aime les robes cintrées à la taille.',
    last_activity_at: new Date().toISOString(),
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_MEASUREMENT_PROFILES: MeasurementProfile[] = [
  {
    id: 'mp-1',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-1',
    version: 1,
    kind: 'standard',
    parent_id: null,
    taken_at: new Date('2026-01-15').toISOString(),
    notes: 'Prise de mesures initiale complet costume & boubou',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-01-15').toISOString(),
    measurements: {
      'mt-h-1': 41, // Tour de cou
      'mt-h-2': 46, // Carrure dos
      'mt-h-3': 102, // Poitrine
      'mt-h-4': 88, // Taille
      'mt-h-5': 76, // Longueur dos
      'mt-h-6': 26, // Manche courte
      'mt-h-7': 64, // Manche longue
      'mt-h-8': 34, // Biceps
      'mt-h-9': 18, // Poignet
      'mt-h-10': 90, // Ceinture
      'mt-h-11': 104, // Bassin
      'mt-h-12': 105, // Longueur pantalon
      'mt-h-13': 79, // Entrejambe
      'mt-h-14': 58, // Cuisse
      'mt-h-15': 40, // Genou
      'mt-h-16': 20, // Cheville
      'mt-h-17': 140, // Boubou
    },
  },
  {
    id: 'mp-2',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-2',
    version: 1,
    kind: 'standard',
    parent_id: null,
    taken_at: new Date('2026-02-01').toISOString(),
    notes: 'Prise de mesures de base robe et pagne',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-02-01').toISOString(),
    measurements: {
      'mt-f-1': 38, // Carrure dos
      'mt-f-2': 37, // Carrure devant
      'mt-f-3': 94, // Poitrine
      'mt-f-4': 78, // Sous-poitrine
      'mt-f-5': 19, // Ecart poitrine
      'mt-f-6': 26, // Hauteur poitrine
      'mt-f-7': 74, // Taille
      'mt-f-8': 42, // Epaule-taille
      'mt-f-9': 102, // Bassin
      'mt-f-10': 20, // Hauteur hanches
      'mt-f-11': 110, // Longueur robe
      'mt-f-12': 60, // Longueur jupe
      'mt-f-13': 104, // Taille-sol
      'mt-f-14': 58, // Manche
      'mt-f-15': 30, // Bras
      'mt-f-16': 16, // Poignet
    },
  },
  {
    id: 'mp-3',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-3',
    version: 1,
    kind: 'standard',
    parent_id: null,
    taken_at: new Date('2026-02-10').toISOString(),
    notes: 'Grand boubou 3 pièces',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-02-10').toISOString(),
    measurements: {
      'mt-h-1': 43,
      'mt-h-2': 49,
      'mt-h-3': 110,
      'mt-h-4': 98,
      'mt-h-5': 80,
      'mt-h-6': 28,
      'mt-h-7': 66,
      'mt-h-8': 37,
      'mt-h-9': 19,
      'mt-h-10': 100,
      'mt-h-11': 112,
      'mt-h-12': 108,
      'mt-h-13': 81,
      'mt-h-14': 62,
      'mt-h-15': 43,
      'mt-h-16': 22,
      'mt-h-17': 148,
    },
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    workshop_id: INITIAL_WORKSHOP.id,
    number: 1,
    client_id: 'cl-1',
    garment_type_id: 'gt-1',
    model: 'Grand Boubou Bazin Riche Broderie Or',
    description: 'Brodé au col et aux poches, manches larges avec finition soignée.',
    color: 'Bleu nuit et fil or',
    fabric: 'Bazin Riche Getzner fourni par le client',
    quantity: 1,
    price: 65000,
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    status: 'en_confection',
    assigned_to: INITIAL_PROFILE.id,
    measurement_profile_id: 'mp-1',
    notes: 'À terminer impérativement avant le mariage de samedi.',
    created_at: new Date('2026-09-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-102',
    workshop_id: INITIAL_WORKSHOP.id,
    number: 2,
    client_id: 'cl-2',
    garment_type_id: 'gt-2',
    model: 'Ensemble Pagne 3 pièces moderne',
    description: 'Jupe sirène avec fente dos discrète, bustier et veste courte.',
    color: 'Wax Hollandais motifs dorés',
    fabric: 'Wax VLISCO 6 yards',
    quantity: 1,
    price: 45000,
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'essayage',
    assigned_to: INITIAL_PROFILE.id,
    measurement_profile_id: 'mp-2',
    notes: 'Essayage prévu demain matin à 10h.',
    created_at: new Date('2026-09-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-103',
    workshop_id: INITIAL_WORKSHOP.id,
    number: 3,
    client_id: 'cl-3',
    garment_type_id: 'gt-8',
    model: 'Tunique Africaine Col Mao',
    description: 'Coupe ajustée, boutons recouverts en tissu wax assorti.',
    color: 'Kaki et motifs marron',
    fabric: 'Lin lourd d’importation',
    quantity: 2,
    price: 50000,
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // En retard !
    status: 'retouche',
    assigned_to: INITIAL_PROFILE.id,
    measurement_profile_id: 'mp-3',
    notes: 'Le client a demandé de reprendre légèrement le bas du pantalon de 1cm.',
    created_at: new Date('2026-09-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord-104',
    workshop_id: INITIAL_WORKSHOP.id,
    number: 4,
    client_id: 'cl-1',
    garment_type_id: 'gt-4',
    model: 'Chemise Wax contemporaine',
    description: 'Poches plaquées, boutons en bois de cocotier.',
    color: 'Jaune moutarde et bleu pétrole',
    fabric: 'Woodin authentic',
    quantity: 1,
    price: 25000,
    due_date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    status: 'prete_a_livrer',
    assigned_to: INITIAL_PROFILE.id,
    measurement_profile_id: 'mp-1',
    notes: 'Prête, repassée et mise sous housse.',
    created_at: new Date('2026-09-22').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    workshop_id: INITIAL_WORKSHOP.id,
    order_id: 'ord-101',
    amount: 40000,
    paid_at: new Date('2026-09-15T10:30:00').toISOString(),
    method: 'mtn_momo',
    reference: 'MOMO-74910328',
    comment: 'Acompte à la commande par MTN Mobile Money',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-09-15T10:30:00').toISOString(),
  },
  {
    id: 'pay-2',
    workshop_id: INITIAL_WORKSHOP.id,
    order_id: 'ord-102',
    amount: 30000,
    paid_at: new Date('2026-09-20T14:15:00').toISOString(),
    method: 'moov_money',
    reference: 'MOOV-9812401',
    comment: 'Acompte de 30 000 FCFA',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-09-20T14:15:00').toISOString(),
  },
  {
    id: 'pay-3',
    workshop_id: INITIAL_WORKSHOP.id,
    order_id: 'ord-103',
    amount: 50000,
    paid_at: new Date('2026-09-10T16:00:00').toISOString(),
    method: 'especes',
    reference: 'RECU-003',
    comment: 'Paiement intégral comptant à la commande',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-09-10T16:00:00').toISOString(),
  },
  {
    id: 'pay-4',
    workshop_id: INITIAL_WORKSHOP.id,
    order_id: 'ord-104',
    amount: 15000,
    paid_at: new Date('2026-09-22T11:00:00').toISOString(),
    method: 'especes',
    reference: null,
    comment: 'Avance en espèces',
    created_by: INITIAL_PROFILE.id,
    created_at: new Date('2026-09-22T11:00:00').toISOString(),
  },
];

// Calculons des RDV dont un AUJOURD'HUI à 15h
const today = new Date();
const today15h = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0);
const today17h = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30, 0);
const tomorrow10h = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0, 0);

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-1',
    order_id: 'ord-101',
    starts_at: today15h.toISOString(),
    duration_min: 30,
    type: 'essayage',
    status: 'confirme',
    notes: 'Premier essayage de la veste du boubou',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-2',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-4',
    order_id: null,
    starts_at: today17h.toISOString(),
    duration_min: 45,
    type: 'mesures',
    status: 'programme',
    notes: 'Prise de mesures pour robe de gala',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-3',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-2',
    order_id: 'ord-102',
    starts_at: tomorrow10h.toISOString(),
    duration_min: 30,
    type: 'essayage',
    status: 'confirme',
    notes: 'Essayage de l’ensemble pagne 3 pièces',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-1',
    body: 'Client très ponctuel. Apprécie un café lors des essayages. Préfère les boutonnières fines.',
    created_by: INITIAL_PROFILE.id,
    author_name: INITIAL_PROFILE.full_name,
    created_at: new Date('2026-01-16').toISOString(),
  },
  {
    id: 'note-2',
    workshop_id: INITIAL_WORKSHOP.id,
    client_id: 'cl-2',
    body: 'Sensible aux tissus synthétiques, n’utiliser que des doublures en popeline 100% coton.',
    created_by: INITIAL_PROFILE.id,
    author_name: INITIAL_PROFILE.full_name,
    created_at: new Date('2026-02-02').toISOString(),
  },
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    workshop_id: INITIAL_WORKSHOP.id,
    entity: 'orders',
    entity_id: 'ord-101',
    action: 'status_updated',
    meta: { from: 'nouvelle', to: 'en_confection' },
    user_id: INITIAL_PROFILE.id,
    user_name: INITIAL_PROFILE.full_name,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-2',
    workshop_id: INITIAL_WORKSHOP.id,
    entity: 'payments',
    entity_id: 'pay-2',
    action: 'payment_received',
    meta: { amount: 30000, method: 'moov_money' },
    user_id: INITIAL_PROFILE.id,
    user_name: INITIAL_PROFILE.full_name,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

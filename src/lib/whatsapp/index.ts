import { formatCurrency, formatDate } from '@/lib/utils';
import { dataStore } from '@/lib/data/store';

export interface WhatsAppMessageParams {
  phone?: string | null;
  prenom?: string;
  nom?: string;
  date?: string | Date;
  numero?: number | string;
  reste?: number;
}

export function formatWestAfricanPhone(phone?: string | null): string {
  if (!phone) return '';
  // Supprime tous les caractères non numériques
  let cleaned = phone.replace(/[^0-9]/g, '');
  // Si le numéro commence par 00, on remplace par rien
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  // Si le numéro a 8 chiffres (numéro classique Bénin avant indicatif) ou 10 chiffres sans 229
  if (cleaned.length === 8) {
    cleaned = '229' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppUrl(
  templateKey: 'rdv' | 'pret' | 'paiement',
  params: WhatsAppMessageParams
): string {
  const workshop = dataStore.getWorkshop();
  const template = dataStore.getMessageTemplateByKey(templateKey);

  let message = template?.body || '';

  // Remplacement des variables
  message = message.replace(/{prenom}/g, params.prenom || 'Cher(e) client(e)');
  message = message.replace(/{atelier}/g, workshop.name);

  if (params.date) {
    message = message.replace(/{date}/g, formatDate(params.date));
  }
  if (params.numero !== undefined) {
    message = message.replace(/{numero}/g, params.numero.toString());
  }
  if (params.reste !== undefined) {
    message = message.replace(/{reste}/g, formatCurrency(params.reste));
  }

  const cleanPhone = formatWestAfricanPhone(params.phone);
  const encodedMessage = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
  return `https://wa.me/?text=${encodedMessage}`;
}

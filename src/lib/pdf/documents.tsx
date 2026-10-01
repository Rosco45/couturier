import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { Client, Order, Payment, Workshop, MeasurementProfile, MeasurementType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Styles PDF professionnels
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#c85a32',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c85a32',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 9,
    color: '#555555',
    marginTop: 2,
  },
  metaBlock: {
    textAlign: 'right',
  },
  metaText: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  col2: {
    width: '50%',
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
  },
  tableCellLeft: {
    flex: 2,
    textAlign: 'left',
  },
  tableCellCenter: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  totalBox: {
    marginTop: 15,
    alignSelf: 'flex-end',
    width: '50%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: '#475569',
  },
  totalVal: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  highlight: {
    color: '#c85a32',
    fontSize: 12,
  },
  signatureZone: {
    marginTop: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    paddingTop: 5,
    textAlign: 'center',
    fontSize: 8,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
});

// Helper de téléchargement
export async function downloadPdfBlob(doc: React.ReactElement, fileName: string) {
  const asPdf = pdf();
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// 1. REÇU DE PAIEMENT
export function ReceiptPDF({
  workshop,
  payment,
  order,
  client,
}: {
  workshop: Workshop;
  payment: Payment;
  order: Order;
  client: Client;
}) {
  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{workshop.name}</Text>
            <Text style={styles.subtitle}>{workshop.address || 'Cotonou, Bénin'}</Text>
            <Text style={styles.subtitle}>Tél: {workshop.phone} | WA: {workshop.whatsapp}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={[styles.title, { fontSize: 14 }]}>REÇU DE PAIEMENT</Text>
            <Text style={styles.metaText}>Réf: {payment.reference || `REC-${payment.id.slice(-6)}`}</Text>
            <Text style={styles.metaText}>Date: {formatDate(payment.paid_at)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Reçu de</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
            <Text style={styles.subtitle}>{client.phone || ''}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Commande Concernée</Text>
            <Text style={styles.value}>Commande #{order.number} - {order.garment_type?.name || 'Vêtement'}</Text>
            <Text style={styles.subtitle}>Modèle: {order.model || '-'}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellLeft}>Désignation</Text>
            <Text style={styles.tableCellCenter}>Mode</Text>
            <Text style={styles.tableCellRight}>Montant versé</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>
              Versement sur commande #{order.number} ({payment.comment || 'Acompte / Paiement'})
            </Text>
            <Text style={styles.tableCellCenter}>{payment.method.toUpperCase()}</Text>
            <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Coût Total Commande :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.price)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total déjà réglé :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.total_paid)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 4 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Reste à solder :</Text>
            <Text style={[styles.totalVal, styles.highlight]}>{formatCurrency(order.remaining)}</Text>
          </View>
        </View>

        <View style={styles.signatureZone}>
          <View style={styles.signatureBox}>
            <Text>Signature du Client</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Pour l&apos;Atelier (Cachet & Signature)</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Merci pour votre confiance. Aucun vêtement ne sera remis sans solde intégral du montant.
        </Text>
      </Page>
    </Document>
  );
}

// 2. FICHE CLIENT
export function ClientFilePDF({
  workshop,
  client,
  orders,
}: {
  workshop: Workshop;
  client: Client;
  orders: Order[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{workshop.name}</Text>
            <Text style={styles.subtitle}>{workshop.address}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={[styles.title, { fontSize: 13 }]}>DOSSIER CLIENT</Text>
            <Text style={styles.metaText}>Édité le: {formatDate(new Date())}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Nom complet</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Genre</Text>
            <Text style={styles.value}>{client.gender === 'm' ? 'Homme' : 'Femme'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Téléphone / WhatsApp</Text>
            <Text style={styles.value}>{client.phone || '-'} / {client.whatsapp || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Profession</Text>
            <Text style={styles.value}>{client.profession || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Adresse</Text>
            <Text style={styles.value}>{client.address || '-'}</Text>
          </View>
        </View>

        {client.notes && (
          <View style={{ marginBottom: 15, padding: 8, backgroundColor: '#fdf8f6', borderWidth: 1, borderColor: '#f2e8e5' }}>
            <Text style={[styles.label, { color: '#c85a32' }]}>Notes particulières :</Text>
            <Text style={{ fontSize: 9, marginTop: 3 }}>{client.notes}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>HISTORIQUE DES COMMANDES ({orders.length})</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={{ flex: 0.8, textAlign: 'left', fontWeight: 'bold' }}>N°</Text>
            <Text style={styles.tableCellLeft}>Vêtement & Modèle</Text>
            <Text style={styles.tableCellCenter}>Livraison</Text>
            <Text style={styles.tableCellCenter}>Statut</Text>
            <Text style={styles.tableCellRight}>Prix</Text>
          </View>
          {orders.map((o) => (
            <View key={o.id} style={styles.tableRow}>
              <Text style={{ flex: 0.8, textAlign: 'left' }}>#{o.number}</Text>
              <Text style={styles.tableCellLeft}>{o.garment_type?.name} - {o.model || ''}</Text>
              <Text style={styles.tableCellCenter}>{formatDate(o.due_date)}</Text>
              <Text style={styles.tableCellCenter}>{o.status}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(o.price)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          {workshop.name} • Logiciel Couturier PWA
        </Text>
      </Page>
    </Document>
  );
}

// 3. FICHE DES MENSURATIONS
export function MeasurementsPDF({
  workshop,
  client,
  profile,
  measurementTypes,
}: {
  workshop: Workshop;
  client: Client;
  profile: MeasurementProfile;
  measurementTypes: MeasurementType[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{workshop.name}</Text>
            <Text style={styles.subtitle}>FICHE DE MENSURATIONS OFFICIELLE</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.value}>Version {profile.version} ({profile.kind.toUpperCase()})</Text>
            <Text style={styles.metaText}>Prise le : {formatDate(profile.taken_at)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
            <Text style={styles.subtitle}>Tél: {client.phone || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Notes de coupe</Text>
            <Text style={{ fontSize: 9 }}>{profile.notes || 'Aucune note particulière.'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>TABLEAU DES MESURES CORPORELLES</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={{ flex: 2, fontWeight: 'bold' }}>Point de Mesure</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Catégorie</Text>
            <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>Valeur (cm)</Text>
          </View>
          {measurementTypes.map((mt) => {
            const val = profile.measurements?.[mt.id];
            if (val === undefined) return null;
            return (
              <View key={mt.id} style={styles.tableRow}>
                <Text style={{ flex: 2 }}>{mt.name}</Text>
                <Text style={{ flex: 1, textAlign: 'center', textTransform: 'capitalize', color: '#64748b' }}>
                  {mt.category}
                </Text>
                <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', color: '#c85a32' }}>
                  {val} cm
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.signatureZone}>
          <View style={styles.signatureBox}>
            <Text>Mesuré par le Maître Tailleur</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Accord du Client</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Document technique de confection • Immuable une fois rattaché à une commande
        </Text>
      </Page>
    </Document>
  );
}

// 4. BON DE COMMANDE ATELIER
export function OrderFormPDF({
  workshop,
  order,
  client,
}: {
  workshop: Workshop;
  order: Order;
  client: Client;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{workshop.name}</Text>
            <Text style={styles.subtitle}>FICHE D&apos;ATELIER & BON DE COMMANDE</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={[styles.title, { fontSize: 16 }]}>COMMANDE #{order.number}</Text>
            <Text style={styles.metaText}>Créée le: {formatDate(order.created_at)}</Text>
            <Text style={[styles.metaText, { color: '#c85a32', fontWeight: 'bold' }]}>
              Livraison prévue: {formatDate(order.due_date)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>CLIENT</Text>
        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Nom complet</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{client.phone || client.whatsapp || '-'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SPÉCIFICATIONS DU VÊTEMENT</Text>
        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Type de Vêtement</Text>
            <Text style={styles.value}>{order.garment_type?.name || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Modèle</Text>
            <Text style={styles.value}>{order.model || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Tissu fourni</Text>
            <Text style={styles.value}>{order.fabric || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Couleur / Motifs</Text>
            <Text style={styles.value}>{order.color || '-'}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Quantité</Text>
            <Text style={styles.value}>{order.quantity}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.label}>Statut de production</Text>
            <Text style={[styles.value, { textTransform: 'uppercase', color: '#c85a32' }]}>{order.status}</Text>
          </View>
        </View>

        {order.description && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}>
            <Text style={styles.label}>Description des finitions :</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>{order.description}</Text>
          </View>
        )}

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Prix convenu :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.price)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Acompte reçu :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.total_paid)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Reste dû :</Text>
            <Text style={[styles.totalVal, styles.highlight]}>{formatCurrency(order.remaining)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Document interne de fabrication • Atelier {workshop.name}
        </Text>
      </Page>
    </Document>
  );
}

// 5. FACTURE CLIENT
export function InvoicePDF({
  workshop,
  order,
  client,
}: {
  workshop: Workshop;
  order: Order;
  client: Client;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{workshop.name}</Text>
            <Text style={styles.subtitle}>{workshop.address}</Text>
            <Text style={styles.subtitle}>Tél: {workshop.phone} | Email: {workshop.email || '-'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={[styles.title, { fontSize: 16 }]}>FACTURE #{order.number}</Text>
            <Text style={styles.metaText}>Date d&apos;émission : {formatDate(new Date())}</Text>
            <Text style={styles.metaText}>Échéance : {formatDate(order.due_date)}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.col2}>
            <Text style={styles.label}>Facturé à</Text>
            <Text style={styles.value}>{client.first_name} {client.last_name}</Text>
            <Text style={styles.subtitle}>{client.address || '-'}</Text>
            <Text style={styles.subtitle}>Tél: {client.phone || '-'}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellLeft}>Article & Prestation</Text>
            <Text style={styles.tableCellCenter}>Qté</Text>
            <Text style={styles.tableCellRight}>Prix Unitaire</Text>
            <Text style={styles.tableCellRight}>Total (FCFA)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>
              Confection sur mesure : {order.garment_type?.name}
              {order.model ? ` (${order.model})` : ''}
            </Text>
            <Text style={styles.tableCellCenter}>{order.quantity}</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(order.price / order.quantity)}</Text>
            <Text style={[styles.tableCellRight, { fontWeight: 'bold' }]}>{formatCurrency(order.price)}</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Facture :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.price)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Acomptes versés :</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.total_paid)}</Text>
          </View>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 4 }]}>
            <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Net à Payer :</Text>
            <Text style={[styles.totalVal, styles.highlight]}>{formatCurrency(order.remaining)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Devise : Franc CFA (XOF). TVA non applicable selon le régime d&apos;imposition de l&apos;artisanat.
        </Text>
      </Page>
    </Document>
  );
}

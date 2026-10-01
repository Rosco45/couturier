import ExcelJS from 'exceljs';
import { Client, Order, Payment, MeasurementProfile, MeasurementType } from '@/types';
import { formatDate } from '@/lib/utils';

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function exportClientsToExcel(clients: Client[], workshopName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Clients');

  worksheet.columns = [
    { header: 'Prénom', key: 'first_name', width: 18 },
    { header: 'Nom', key: 'last_name', width: 18 },
    { header: 'Genre', key: 'gender', width: 10 },
    { header: 'Téléphone', key: 'phone', width: 18 },
    { header: 'WhatsApp', key: 'whatsapp', width: 18 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Adresse', key: 'address', width: 25 },
    { header: 'Profession', key: 'profession', width: 20 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'Dernière activité', key: 'last_activity', width: 18 },
  ];

  // En-tête stylisé
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC85A32' }, // Terracotta
  };

  clients.forEach((c) => {
    worksheet.addRow({
      first_name: c.first_name,
      last_name: c.last_name,
      gender: c.gender === 'm' ? 'Homme' : 'Femme',
      phone: c.phone || '-',
      whatsapp: c.whatsapp || '-',
      email: c.email || '-',
      address: c.address || '-',
      profession: c.profession || '-',
      status: c.archived_at ? 'Archivé' : 'Actif',
      last_activity: formatDate(c.last_activity_at),
    });
  });

  await downloadWorkbook(workbook, `Clients_${workshopName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
}

export async function exportOrdersToExcel(orders: Order[], workshopName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Commandes');

  worksheet.columns = [
    { header: 'N°', key: 'number', width: 8 },
    { header: 'Client', key: 'client', width: 22 },
    { header: 'Vêtement', key: 'garment', width: 22 },
    { header: 'Modèle', key: 'model', width: 25 },
    { header: 'Tissu', key: 'fabric', width: 20 },
    { header: 'Prix (FCFA)', key: 'price', width: 15 },
    { header: 'Total Payé (FCFA)', key: 'paid', width: 18 },
    { header: 'Reste (FCFA)', key: 'remaining', width: 15 },
    { header: 'Date livraison', key: 'due_date', width: 16 },
    { header: 'Statut', key: 'status', width: 16 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  };

  orders.forEach((o) => {
    worksheet.addRow({
      number: o.number,
      client: o.client ? `${o.client.first_name} ${o.client.last_name}` : '-',
      garment: o.garment_type?.name || '-',
      model: o.model || '-',
      fabric: o.fabric || '-',
      price: o.price,
      paid: o.total_paid || 0,
      remaining: o.remaining || 0,
      due_date: formatDate(o.due_date),
      status: o.status,
    });
  });

  await downloadWorkbook(workbook, `Commandes_${workshopName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
}

export async function exportPaymentsToExcel(payments: Payment[], workshopName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Paiements');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 16 },
    { header: 'Commande N°', key: 'order_number', width: 15 },
    { header: 'Client', key: 'client', width: 22 },
    { header: 'Montant (FCFA)', key: 'amount', width: 18 },
    { header: 'Mode de paiement', key: 'method', width: 18 },
    { header: 'Référence', key: 'reference', width: 20 },
    { header: 'Commentaire', key: 'comment', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D9488' }, // Teal
  };

  payments.forEach((p) => {
    worksheet.addRow({
      date: formatDate(p.paid_at),
      order_number: p.order?.number ? `#${p.order.number}` : '-',
      client: p.order?.client ? `${p.order.client.first_name} ${p.order.client.last_name}` : '-',
      amount: p.amount,
      method: p.method,
      reference: p.reference || '-',
      comment: p.comment || '-',
    });
  });

  await downloadWorkbook(workbook, `Paiements_${workshopName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
}

export async function exportMeasurementsToExcel(
  profiles: MeasurementProfile[],
  measurementTypes: MeasurementType[],
  clientName: string
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Mensurations');

  const headers = ['Mesure', 'Catégorie', 'Unité'];
  profiles.forEach((p) => {
    headers.push(`Version ${p.version} (${formatDate(p.taken_at)})`);
  });

  worksheet.addRow(headers);
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC85A32' },
  };

  measurementTypes.forEach((mt) => {
    const rowValues = [mt.name, mt.category, mt.unit];
    profiles.forEach((p) => {
      const val = p.measurements?.[mt.id];
      rowValues.push(val !== undefined ? `${val} cm` : '-');
    });
    worksheet.addRow(rowValues);
  });

  await downloadWorkbook(workbook, `Mensurations_${clientName.replace(/\s+/g, '_')}.xlsx`);
}

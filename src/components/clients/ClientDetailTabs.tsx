"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Ruler,
  Scissors,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  FileText,
  History,
  Phone,
  MessageSquare,
  FileSpreadsheet,
  Download,
  Plus,
  Lock,
  TrendingUp,
  Archive,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Client,
  MeasurementProfile,
  MeasurementType,
  Order,
  Appointment,
  Payment,
  Note,
  ActivityLog,
} from "@/types";
import { dataStore } from "@/lib/data/store";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { generateWhatsAppUrl, formatWestAfricanPhone } from "@/lib/whatsapp";
import { exportMeasurementsToExcel } from "@/lib/excel";
import { downloadPdfBlob, ClientFilePDF, MeasurementsPDF, ReceiptPDF } from "@/lib/pdf/documents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ClientDetailTabsProps {
  client: Client;
  profiles: MeasurementProfile[];
  measurementTypes: MeasurementType[];
  orders: Order[];
  appointments: Appointment[];
  payments: Payment[];
  notes: Note[];
  logs: ActivityLog[];
  onRefresh: () => void;
}

export function ClientDetailTabs({
  client,
  profiles,
  measurementTypes,
  orders,
  appointments,
  payments,
  notes,
  logs,
  onRefresh,
}: ClientDetailTabsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("infos");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ""
  );
  const [newNoteText, setNewNoteText] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const selectedProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const workshop = dataStore.getWorkshop();

  // WhatsApp wa.me trigger
  const cleanPhone = formatWestAfricanPhone(client.whatsapp || client.phone);
  const waDirectUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  // Téléchargement PDF Dossier Client
  const handleDownloadClientPDF = async () => {
    try {
      setIsExporting(true);
      const doc = <ClientFilePDF workshop={workshop} client={client} orders={orders} />;
      await downloadPdfBlob(doc, `Dossier_Client_${client.first_name}_${client.last_name}.pdf`);
      toast("Dossier client PDF téléchargé !");
    } catch (e) {
      toast("Erreur téléchargement PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Téléchargement PDF Mensurations
  const handleDownloadMeasurementsPDF = async () => {
    if (!selectedProfile) return;
    try {
      setIsExporting(true);
      const doc = (
        <MeasurementsPDF
          workshop={workshop}
          client={client}
          profile={selectedProfile}
          measurementTypes={measurementTypes}
        />
      );
      await downloadPdfBlob(
        doc,
        `Mensurations_v${selectedProfile.version}_${client.first_name}_${client.last_name}.pdf`
      );
      toast("Fiche de mensurations PDF téléchargée !");
    } catch (e) {
      toast("Erreur téléchargement PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Excel Mensurations
  const handleExportMeasurementsExcel = async () => {
    try {
      setIsExporting(true);
      await exportMeasurementsToExcel(
        profiles,
        measurementTypes,
        `${client.first_name} ${client.last_name}`
      );
      toast("Export Excel des mensurations réussi !");
    } catch (e) {
      toast("Erreur lors de l'export Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Téléchargement Reçu de Paiement PDF
  const handleDownloadReceiptPDF = async (payment: Payment) => {
    const order = orders.find((o) => o.id === payment.order_id);
    if (!order) return;
    try {
      setIsExporting(true);
      const doc = (
        <ReceiptPDF
          workshop={workshop}
          payment={payment}
          order={order}
          client={client}
        />
      );
      await downloadPdfBlob(
        doc,
        `Recu_${payment.reference || payment.id}_${client.last_name}.pdf`
      );
      toast("Reçu de paiement PDF généré !");
    } catch (e) {
      toast("Erreur génération reçu PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Archivage / Désarchivage
  const handleToggleArchive = () => {
    const isArchived = !!client.archived_at;
    dataStore.archiveClient(client.id, !isArchived);
    toast(isArchived ? "Client réactivé !" : "Client archivé !");
    onRefresh();
  };

  // Ajout de note rapide
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    dataStore.createNote(client.id, newNoteText.trim());
    setNewNoteText("");
    toast("Note ajoutée !");
    onRefresh();
  };

  // Données pour le graphique d'évolution des mesures dans le temps
  const evolutionChartData = profiles
    .slice()
    .reverse()
    .map((p) => {
      const point: any = {
        name: `v${p.version} (${formatDate(p.taken_at)})`,
      };
      // On trace 3 mesures principales selon le genre
      if (client.gender === "m") {
        point["Poitrine"] = p.measurements?.["mt-h-3"] || null;
        point["Taille"] = p.measurements?.["mt-h-4"] || null;
        point["Bassin"] = p.measurements?.["mt-h-11"] || null;
      } else {
        point["Poitrine"] = p.measurements?.["mt-f-3"] || null;
        point["Taille"] = p.measurements?.["mt-f-7"] || null;
        point["Bassin"] = p.measurements?.["mt-f-9"] || null;
      }
      return point;
    });

  return (
    <div className="space-y-4">
      {/* En-tête Client Mobile & Actions Rapides */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border bg-card shadow-sm gap-3">
        <div className="flex items-center space-x-3.5">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-2xl text-lg font-bold shrink-0 ${
              client.gender === "f"
                ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {client.first_name.charAt(0)}
            {client.last_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold leading-tight">
                {client.first_name} {client.last_name}
              </h2>
              <Badge variant="outline" className="text-xs">
                {client.gender === "m" ? "Homme" : "Femme"}
              </Badge>
              {client.archived_at && <Badge variant="secondary">Archivé</Badge>}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {client.profession ? `${client.profession} • ` : ""}
              {client.address || "Adresse non renseignée"}
            </div>
          </div>
        </div>

        {/* Boutons d'action : Appel, WhatsApp direct, Nouvelle Commande */}
        <div className="flex items-center space-x-2">
          {client.phone && (
            <a href={`tel:${client.phone}`}>
              <Button variant="outline" size="sm" className="min-h-[44px]">
                <Phone className="h-4 w-4 mr-1 text-primary" />
                <span>Appeler</span>
              </Button>
            </a>
          )}

          {waDirectUrl && (
            <a href={waDirectUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="sm" className="min-h-[44px]">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>WhatsApp</span>
              </Button>
            </a>
          )}

          <Link href={`/orders/new?client_id=${client.id}`}>
            <Button size="sm" className="min-h-[44px]">
              <Scissors className="h-4 w-4 mr-1" />
              <span>Commande</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Onglets Fiche Client (8 onglets) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start p-1 h-13 overflow-x-auto bg-muted rounded-xl">
          <TabsTrigger value="infos" className="flex items-center space-x-1 min-h-[40px]">
            <User className="h-3.5 w-3.5" />
            <span>Infos</span>
          </TabsTrigger>
          <TabsTrigger value="mensurations" className="flex items-center space-x-1 min-h-[40px]">
            <Ruler className="h-3.5 w-3.5" />
            <span>Mesures ({profiles.length})</span>
          </TabsTrigger>
          <TabsTrigger value="commandes" className="flex items-center space-x-1 min-h-[40px]">
            <Scissors className="h-3.5 w-3.5" />
            <span>Commandes ({orders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rdv" className="flex items-center space-x-1 min-h-[40px]">
            <Calendar className="h-3.5 w-3.5" />
            <span>RDV ({appointments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="paiements" className="flex items-center space-x-1 min-h-[40px]">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Paiements ({payments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center space-x-1 min-h-[40px]">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photos</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center space-x-1 min-h-[40px]">
            <FileText className="h-3.5 w-3.5" />
            <span>Notes ({notes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="historique" className="flex items-center space-x-1 min-h-[40px]">
            <History className="h-3.5 w-3.5" />
            <span>Historique</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. ONGLET INFOS */}
        <TabsContent value="infos" className="space-y-4">
          <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Coordonnées & Profil</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadClientPDF}
                  disabled={isExporting}
                  className="min-h-[38px]"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span>Dossier PDF</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleArchive}
                  className="min-h-[38px] text-muted-foreground"
                >
                  <Archive className="h-3.5 w-3.5 mr-1" />
                  <span>{client.archived_at ? "Désarchiver" : "Archiver"}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Téléphone d&apos;appel
                  </span>
                  <span className="font-medium text-foreground">{client.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Numéro WhatsApp
                  </span>
                  <span className="font-medium text-foreground">{client.whatsapp || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Email
                  </span>
                  <span className="font-medium text-foreground">{client.email || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Date de naissance
                  </span>
                  <span className="font-medium text-foreground">
                    {client.birth_date ? formatDate(client.birth_date) : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Adresse / Quartier
                  </span>
                  <span className="font-medium text-foreground">{client.address || "-"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">
                    Profession
                  </span>
                  <span className="font-medium text-foreground">{client.profession || "-"}</span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-4 p-3 rounded-xl bg-muted/50 border text-xs">
                  <span className="font-semibold text-primary block mb-1">
                    Notes & Exigences particulières :
                  </span>
                  <p className="text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. ONGLET MENSURATIONS (RÈGLES 2-4) */}
        <TabsContent value="mensurations" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold">Mensurations Corporelles</h3>
              <Badge variant="secondary">{profiles.length} version(s)</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMeasurementsExcel}
                className="min-h-[40px]"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1 text-emerald-600" />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMeasurementsPDF}
                className="min-h-[40px]"
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Fiche PDF</span>
              </Button>
              <Link href={`/measurements/wizard?client_id=${client.id}`}>
                <Button size="sm" className="min-h-[40px]">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Nouvelle Version</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Sélecteur de versions de profil */}
          {profiles.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {profiles.map((p) => {
                const isSelected = p.id === selectedProfile?.id;
                const isImmutable = dataStore.isMeasurementProfileImmutable(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-medium shrink-0 transition-all min-h-[44px] ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>Version {p.version}</span>
                    {isImmutable && (
                      <span title="Immuable (liée à une commande)">
                        <Lock className="h-3 w-3 shrink-0" />
                      </span>
                    )}
                    <span className="opacity-70 text-[10px]">
                      ({formatDate(p.taken_at)})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedProfile ? (
            <Card>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base">
                      Version {selectedProfile.version} ({selectedProfile.kind.toUpperCase()})
                    </CardTitle>
                    {dataStore.isMeasurementProfileImmutable(selectedProfile.id) ? (
                      <Badge variant="secondary" className="text-[10px] flex items-center space-x-1">
                        <Lock className="h-3 w-3 mr-1 text-primary" />
                        <span>Immuable (Commande en cours)</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Modifiable</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mesures relevées le {formatDate(selectedProfile.taken_at)}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                {selectedProfile.notes && (
                  <div className="mb-3 p-2.5 rounded-lg bg-muted text-xs italic">
                    Note de coupe : {selectedProfile.notes}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {measurementTypes
                    .filter((mt) => mt.gender === client.gender || mt.gender === "both")
                    .map((mt) => {
                      const val = selectedProfile.measurements?.[mt.id];
                      return (
                        <div
                          key={mt.id}
                          className="p-3 rounded-xl border bg-card flex flex-col justify-between min-h-[64px]"
                        >
                          <span className="text-[11px] text-muted-foreground truncate">
                            {mt.name}
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {val !== undefined ? `${val} cm` : "-"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 border rounded-xl bg-card p-4">
              <Ruler className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Aucune mensuration enregistrée</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lancez le Wizard de prise de mesures pour créer la Version 1.
              </p>
              <Link href={`/measurements/wizard?client_id=${client.id}`} className="inline-block mt-3">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Prendre les mesures
                </Button>
              </Link>
            </div>
          )}

          {/* Courbe d'évolution Recharts des mesures corporelles */}
          {evolutionChartData.length > 1 && (
            <Card>
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-sm font-semibold flex items-center space-x-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Évolution Corporelle du Client</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Suivi des variations (Poitrine, Taille, Bassin en cm) au fil des versions
                </p>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionChartData}>
                      <XAxis dataKey="name" fontSize={10} stroke="#888888" />
                      <YAxis domain={["auto", "auto"]} fontSize={10} stroke="#888888" width={30} />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "11px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Line type="monotone" dataKey="Poitrine" stroke="#c85a32" strokeWidth={2} />
                      <Line type="monotone" dataKey="Taille" stroke="#0d9488" strokeWidth={2} />
                      <Line type="monotone" dataKey="Bassin" stroke="#eab308" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 3. ONGLET COMMANDES */}
        <TabsContent value="commandes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Commandes ({orders.length})</h3>
            <Link href={`/orders/new?client_id=${client.id}`}>
              <Button size="sm" className="min-h-[40px]">
                <Plus className="h-4 w-4 mr-1" />
                <span>Nouvelle Commande</span>
              </Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 border rounded-xl bg-card p-4">
              <Scissors className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Aucune commande pour ce client</p>
              <Link href={`/orders/new?client_id=${client.id}`} className="inline-block mt-3">
                <Button size="sm">Créer une commande</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-colors flex items-center justify-between min-h-[64px]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-terracotta-50 text-terracotta-700 font-bold flex items-center justify-center text-xs">
                      #{o.number}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {o.garment_type?.name} {o.model ? `• ${o.model}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Livraison : {formatDate(o.due_date)} {o.fabric ? `• ${o.fabric}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm">{formatCurrency(o.price)}</div>
                    <div className="mt-0.5">
                      <OrderStatusBadge status={o.status} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 4. ONGLET RDV */}
        <TabsContent value="rdv" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Rendez-vous ({appointments.length})</h3>
            <Link href={`/appointments/new?client_id=${client.id}`}>
              <Button size="sm" className="min-h-[40px]">
                <Plus className="h-4 w-4 mr-1" />
                <span>Nouveau RDV</span>
              </Button>
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 border rounded-xl bg-card p-4">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Aucun rendez-vous planifié</p>
            </div>
          ) : (
            <div className="divide-y border rounded-xl bg-card">
              {appointments.map((a) => (
                <div key={a.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm capitalize">{a.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(a.starts_at)} ({a.duration_min} min)
                    </div>
                    {a.notes && <p className="text-xs italic mt-0.5">{a.notes}</p>}
                  </div>
                  <Badge variant="outline" className="capitalize">{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 5. ONGLET PAIEMENTS */}
        <TabsContent value="paiements" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Paiements Réalisés ({payments.length})</h3>
            <span className="text-xs font-semibold text-primary">
              Total payé : {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8 border rounded-xl bg-card p-4">
              <CreditCard className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Aucun versement enregistré</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border bg-card flex items-center justify-between min-h-[56px]"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {formatCurrency(p.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(p.paid_at)} • Mode :{" "}
                      <span className="uppercase font-medium">{p.method}</span>
                      {p.reference ? ` (${p.reference})` : ""}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceiptPDF(p)}
                    className="min-h-[40px] text-xs space-x-1"
                    title="Télécharger le reçu officiel PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Reçu PDF</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 6. ONGLET PHOTOS */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Galerie Photos & Inspirations</h3>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-card">
            <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-sm">Ajouter une photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Modèle, tissu, croquis ou essayage (compression automatique)
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="photo-upload"
              onChange={() => toast("Photo importée dans la galerie !")}
            />
            <label htmlFor="photo-upload" className="inline-block mt-3">
              <Button asChild size="sm" className="cursor-pointer min-h-[40px]">
                <span>Choisir une photo</span>
              </Button>
            </label>
          </div>
        </TabsContent>

        {/* 7. ONGLET NOTES */}
        <TabsContent value="notes" className="space-y-4">
          <form onSubmit={handleAddNote} className="space-y-2">
            <Textarea
              placeholder="Ajouter une note de travail (ex: doublure spécifique, tissu wax apporté le 15, boutons dorés)..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              rows={2}
            />
            <Button type="submit" size="sm" className="min-h-[40px]">
              <Plus className="h-4 w-4 mr-1" /> Ajouter la Note
            </Button>
          </form>

          <div className="space-y-2 mt-3">
            {notes.map((n) => (
              <div key={n.id} className="p-3 rounded-xl border bg-card text-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>{n.author_name || "Tailleur"}</span>
                  <span>{formatDate(n.created_at)}</span>
                </div>
                <p className="text-foreground text-sm">{n.body}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 8. ONGLET HISTORIQUE */}
        <TabsContent value="historique" className="space-y-3">
          <h3 className="text-base font-bold">Journal d&apos;Activité</h3>
          <div className="divide-y border rounded-xl bg-card">
            {logs.map((l) => (
              <div key={l.id} className="p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground capitalize">
                    {l.action.replace("_", " ")}
                  </span>
                  <div className="text-[11px] text-muted-foreground">
                    Par {l.user_name || "Système"}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {formatDateTime(l.created_at)}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

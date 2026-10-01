import { z } from "zod";

export const orderSchema = z.object({
  client_id: z.string().min(1, "Veuillez sélectionner un client"),
  garment_type_id: z.string().min(1, "Veuillez sélectionner un type de vêtement"),
  model: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  fabric: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "La quantité minimale est de 1"),
  price: z.number().int().min(0, "Le prix en FCFA doit être positif"),
  due_date: z.string().min(1, "La date de livraison est requise"),
  status: z.enum([
    "nouvelle",
    "en_attente",
    "tissu_recu",
    "en_confection",
    "essayage",
    "retouche",
    "terminee",
    "prete_a_livrer",
    "livree",
    "annulee",
  ]),
  measurement_choice: z.enum(["latest", "new", "custom"]),
  measurement_profile_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

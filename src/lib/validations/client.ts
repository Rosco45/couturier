import { z } from "zod";

export const clientSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  gender: z.enum(["m", "f"]),
  birth_date: z.string().optional().nullable(),
  phone: z.string().min(6, "Numéro de téléphone requis"),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Adresse email invalide").optional().or(z.literal("")),
  address: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// Define all possible add-ons in one place
export const ALL_ADDONS: { [key: string]: { label: string; price: number } } = {
  canela: { label: "Canela (cinnamon)", price: 0 },
  extra_espresso: { label: "Extra shot de espresso", price: 10 },
  crema_batida: { label: "Crema batida (whipped cream)", price: 10 },
  leche_deslactosada: { label: "Leche deslactosada", price: 0 },
  leche_almendra: { label: "Leche de almendra", price: 10 },
  leche_avena: { label: "Leche de avena", price: 10 },
  leche_soya: { label: "Leche de soya", price: 10 },
  nutella: { label: "Nutella", price: 10 },
  cajeta: { label: "Cajeta", price: 10 },
  lechera: { label: "Lechera", price: 10 },
  mermelada_fresa: { label: "Mermelada de fresa", price: 10 },
  mermelada_zarzamora: { label: "Mermelada de zarzamora", price: 10 },
  queso_crema: { label: "Queso crema", price: 10 },
  fresa: { label: "Fresa", price: 10 },
  platano: { label: "Plátano", price: 10 },
  durazno: { label: "Durazno", price: 10 },
  nuez: { label: "Nuez", price: 10 },
  almendra: { label: "Almendra", price: 10 },
  granola: { label: "Granola", price: 10 },
  frutas: { label: "Frutas", price: 10 },
  miel: { label: "Miel", price: 10 },
  chispas_chocolate: { label: "Chispas de chocolate", price: 10 },
  ajonjoli_caramelizado: { label: "Ajonjolí caramelizado", price: 10 },
  coco_rallado: { label: "Coco rallado", price: 10 },
};

// Add a type for possibleAddons
export type AddonKey = keyof typeof ALL_ADDONS;

// Define reusable sets of add-on keys
export const DRINK_ADDON_KEYS = [
  "canela", "extra_espresso", "crema_batida", "leche_deslactosada", "leche_almendra", "leche_avena", "leche_soya"
] as const;

export const CREPE_TOPPING_KEYS = [
  "nutella", "cajeta", "lechera", "mermelada_fresa", "mermelada_zarzamora", "queso_crema", "fresa", "platano", "durazno", "nuez", "almendra"
] as const;

export const FRESAS_TOPPING_KEYS = [
  "chispas_chocolate", "ajonjoli_caramelizado", "nuez", "almendra", "coco_rallado"
] as const; 
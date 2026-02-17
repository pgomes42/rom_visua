import roomStudio from "@/assets/room-studio.jpg";
import roomT1 from "@/assets/room-t1.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import roomFamily from "@/assets/room-family.jpg";
import roomPresidential from "@/assets/room-presidential.jpg";

export interface Apartment {
  id: string;
  nome: string;
  tipologia: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  suites: number;
  banheiros: number;
  dimensao: string;
  localizacao: string;
  fotos: string[];
  status: "ativo" | "inativo";
}

export type BookingStatus =
  | "PENDENTE_PAGAMENTO"
  | "CONFIRMADA"
  | "CHECKIN_REALIZADO"
  | "FINALIZADA"
  | "CANCELADA"
  | "EXPIRADA";

export type PaymentMethod = "EXPRESS" | "REFERENCIA" | "TRANSFERENCIA" | "PRESENCIAL";

export type RemainingPaymentMethod = "TRANSFERENCIA" | "DINHEIRO" | "TPA";

export interface BookingExtra {
  id: string;
  item: string;
  quantidade: number;
  preco_unitario: number;
  data: string;
}

export interface Booking {
  id: string;
  cliente_nome: string;
  telefone: string;
  email: string;
  apartment_id: string;
  checkin: string; // ISO format
  checkout: string; // ISO format
  noites: number;
  total_estadia: number;
  valor_sinal: number;
  referencia_pagamento: string;
  status: BookingStatus;
  created_at: string; // ISO format
  pessoas: number;
  checkin_real?: string; // ISO format
  checkout_real?: string; // ISO format
  operador_checkin?: string; // Email do operador que fez check-in
  operador_checkout?: string; // Email do operador que fez checkout
  extras?: BookingExtra[];
  expires_at: string; // ISO format (created_at + 2h)
  metodo_pagamento?: PaymentMethod;
  metodo_pagamento_saldo?: RemainingPaymentMethod;
  restante_pagar: number;
}

export const apartments: Apartment[] = [
  {
    id: "estudio-boutique",
    nome: "Estúdio Boutique",
    tipologia: "Estúdio",
    descricao: "Um espaço íntimo e sofisticado, perfeito para estadias individuais ou a dois. Design minimalista com acabamentos premium e iluminação ambiente cuidadosamente pensada.",
    preco_noite: 90000,
    capacidade: 2,
    suites: 1,
    banheiros: 1,
    dimensao: "40 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomStudio],
    status: "ativo",
  },
  {
    id: "apartamento-t1-prime",
    nome: "Apartamento T1 Prime",
    tipologia: "T1",
    descricao: "Apartamento premium com sala e quarto separados, ideal para quem procura espaço e privacidade. Decoração contemporânea com vista panorâmica.",
    preco_noite: 125000,
    capacidade: 2,
    suites: 1,
    banheiros: 1,
    dimensao: "55 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomT1],
    status: "ativo",
  },
  {
    id: "box-executiva-elite",
    nome: "Box Executiva Elite",
    tipologia: "Executiva",
    descricao: "Suite executiva de alto padrão com duas áreas privadas. Ideal para viajantes de negócios que exigem conforto absoluto e espaço para trabalho.",
    preco_noite: 300000,
    capacidade: 4,
    suites: 2,
    banheiros: 2,
    dimensao: "80 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomExecutive],
    status: "ativo",
  },
  {
    id: "box-executiva-prestige",
    nome: "Box Executiva Prestige",
    tipologia: "Executiva",
    descricao: "A versão prestige da nossa suite executiva, com acabamentos superiores, amenidades exclusivas e serviço personalizado dedicado.",
    preco_noite: 300000,
    capacidade: 4,
    suites: 2,
    banheiros: 2,
    dimensao: "85 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomExecutive],
    status: "ativo",
  },
  {
    id: "box-familiar-comfort",
    nome: "Box Familiar Comfort",
    tipologia: "Familiar",
    descricao: "Espaço generoso pensado para famílias, com duas suites completas e áreas comuns acolhedoras. Conforto e segurança para toda a família.",
    preco_noite: 250000,
    capacidade: 5,
    suites: 2,
    banheiros: 2,
    dimensao: "95 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomFamily],
    status: "ativo",
  },
  {
    id: "box-presidencial-royal",
    nome: "Box Presidencial Royal",
    tipologia: "Presidencial",
    descricao: "A experiência máxima em alojamento boutique. Suite presidencial com acabamentos de luxo, mobiliário exclusivo e serviço VIP completo.",
    preco_noite: 250000,
    capacidade: 4,
    suites: 2,
    banheiros: 2,
    dimensao: "110 m²",
    localizacao: "Patriota, Luanda",
    fotos: [roomPresidential],
    status: "ativo",
  },
];

export const BOOKING_DEPOSIT = 25000;

// Informações do Roomview Boutique
export const HOTEL_INFO = {
  nome: "Room View Boutique",
  endereco: "Rua Patriota, Luanda, Angola",
  coordenadas: {
    latitude: -8.9452583,
    longitude: 13.1983771,
  },
  googlemaps_url: "https://maps.app.goo.gl/BpnFJg6sJr3ynGqW8",
  descricao: "Hotel boutique de luxo no coração de Luanda, oferecendo acomodações sofisticadas e serviços personalizados.",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(value) + " AKZ";
}

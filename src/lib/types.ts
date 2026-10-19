export type Category = {
  id: string;
  name: string;
  slug: string;
  sort: number;
};

export type Service = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_min: number;
  price_max: number | null;
  duration_min: number;
  deposit_amount: number;
  hair_included: boolean;
  active: boolean;
  sort: number;
};

export type Stylist = {
  id: string;
  name: string;
  bio: string | null;
  specialties: string[];
  active: boolean;
  sort: number;
};

export type OpeningHours = {
  weekday: number; // 0 = Sunday
  opens: string | null; // "HH:MM" or "HH:MM:SS"
  closes: string | null;
  closed: boolean;
};

export type GalleryImage = {
  id: string;
  url: string;
  style: string;
  caption: string | null;
  sort: number;
};

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type Catalog = {
  categories: Category[];
  services: Service[];
  stylists: Stylist[];
  hours: OpeningHours[];
};

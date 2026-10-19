// Catalogue used before Supabase is connected (and mirrored in supabase/seed.sql).
import type { Catalog, Category, OpeningHours, Service, Stylist } from "./types";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const categories: Category[] = [
  { id: id(1), name: "Braids", slug: "braids", sort: 1 },
  { id: id(2), name: "Cornrows & Weaving", slug: "cornrows", sort: 2 },
  { id: id(3), name: "Weaves & Wigs", slug: "wigs", sort: 3 },
  { id: id(4), name: "Locs", slug: "locs", sort: 4 },
  { id: id(5), name: "Relaxer & Treatments", slug: "treatments", sort: 5 },
  { id: id(6), name: "Natural Hair", slug: "natural", sort: 6 },
  { id: id(7), name: "Kids", slug: "kids", sort: 7 },
];

type Row = [number, number, string, string, number, number | null, number, number];
const rows: Row[] = [
  [101, 1, "Knotless braids (medium)", "Lightweight, tension-free braids. Waist length available.", 25000, 45000, 300, 5000],
  [102, 1, "Box braids", "Classic box braids, any size.", 20000, 35000, 270, 5000],
  [103, 1, "Boho braids", "Knotless braids with curly human-hair pieces.", 35000, 55000, 330, 10000],
  [201, 2, "Straight-back cornrows", "Neat cornrows, with or without extensions.", 5000, 8000, 60, 0],
  [202, 2, "Stitch braids", "Feed-in stitch braids, 6–12 lines.", 12000, 20000, 120, 3000],
  [203, 2, "Ghana weaving", "Classic Ghana weaving in any pattern.", 8000, 15000, 120, 2000],
  [301, 3, "Sew-in weave", "Full sew-in with leave-out or closure.", 15000, 25000, 150, 3000],
  [302, 3, "Frontal wig install", "Lace frontal install, plucking and styling.", 15000, 25000, 120, 5000],
  [303, 3, "Closure wig install", "Closure wig install and styling.", 10000, 18000, 90, 3000],
  [304, 3, "Wig revamp", "Wash, condition and restyle your wig.", 8000, null, 90, 0],
  [401, 4, "Starter locs", "Comb coils or two-strand starter locs.", 25000, 40000, 240, 5000],
  [402, 4, "Loc retwist", "Retwist and simple style.", 10000, 15000, 120, 0],
  [501, 5, "Relaxer + styling", "Retouch relaxer, treatment and style.", 8000, 12000, 90, 0],
  [502, 5, "Deep conditioning", "Steam treatment for strong, soft hair.", 6000, null, 60, 0],
  [503, 5, "Silk press", "Wash, blow-dry and silk press.", 10000, 15000, 90, 0],
  [601, 6, "Twist out", "Two-strand twists set for a defined twist out.", 7000, 10000, 90, 0],
  [602, 6, "Threading", "African threading, any pattern.", 4000, 6000, 60, 0],
  [701, 7, "Kids braids", "Braids for ages 3–12, with beads on request.", 10000, 18000, 150, 2000],
  [702, 7, "Kids cornrows", "Simple cornrows for little ones.", 4000, 7000, 60, 0],
];

const services: Service[] = rows.map(([n, cat, name, description, min, max, dur, dep], i) => ({
  id: id(n),
  category_id: id(cat),
  name,
  description,
  price_min: min,
  price_max: max,
  duration_min: dur,
  deposit_amount: dep,
  hair_included: false,
  active: true,
  sort: i,
}));

const stylists: Stylist[] = [
  { id: id(901), name: "Aisha", bio: "Braids specialist with 8 years of experience.", specialties: ["Braids", "Kids"], active: true, sort: 1 },
  { id: id(902), name: "Blessing", bio: "Wig installs, frontals and silk presses.", specialties: ["Weaves & Wigs", "Treatments"], active: true, sort: 2 },
  { id: id(903), name: "Funmi", bio: "Locs, natural hair and cornrows.", specialties: ["Locs", "Natural Hair", "Cornrows"], active: true, sort: 3 },
];

const hours: OpeningHours[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) =>
  weekday === 0
    ? { weekday, opens: "13:00", closes: "18:00", closed: false }
    : { weekday, opens: "08:00", closes: "19:00", closed: false },
);

export const demoCatalog: Catalog = { categories, services, stylists, hours };

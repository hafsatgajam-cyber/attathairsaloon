-- Starter data. Prices are placeholders: update them in the admin dashboard.
-- IDs match src/lib/demo-data.ts so the site looks the same before and after
-- Supabase is connected.

insert into categories (id, name, slug, sort) values
  ('00000000-0000-4000-8000-000000000001', 'Braids',               'braids',     1),
  ('00000000-0000-4000-8000-000000000002', 'Cornrows & Weaving',   'cornrows',   2),
  ('00000000-0000-4000-8000-000000000003', 'Weaves & Wigs',        'wigs',       3),
  ('00000000-0000-4000-8000-000000000004', 'Locs',                 'locs',       4),
  ('00000000-0000-4000-8000-000000000005', 'Relaxer & Treatments', 'treatments', 5),
  ('00000000-0000-4000-8000-000000000006', 'Natural Hair',         'natural',    6),
  ('00000000-0000-4000-8000-000000000007', 'Kids',                 'kids',       7);

insert into services (id, category_id, name, description, price_min, price_max, duration_min, deposit_amount, hair_included, sort) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Knotless braids (medium)', 'Lightweight, tension-free braids. Waist length available.', 25000, 45000, 300, 5000, false, 1),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Box braids',               'Classic box braids, any size.',                           20000, 35000, 270, 5000, false, 2),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Boho braids',              'Knotless braids with curly human-hair pieces.',           35000, 55000, 330, 10000, false, 3),
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000002', 'Straight-back cornrows',   'Neat cornrows, with or without extensions.',               5000,  8000,  60, 0,    false, 1),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000002', 'Stitch braids',            'Feed-in stitch braids, 6–12 lines.',                      12000, 20000, 120, 3000, false, 2),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000002', 'Ghana weaving',            'Classic Ghana weaving in any pattern.',                    8000, 15000, 120, 2000, false, 3),
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000003', 'Sew-in weave',             'Full sew-in with leave-out or closure.',                  15000, 25000, 150, 3000, false, 1),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000003', 'Frontal wig install',      'Lace frontal install, plucking and styling.',             15000, 25000, 120, 5000, false, 2),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000003', 'Closure wig install',      'Closure wig install and styling.',                        10000, 18000,  90, 3000, false, 3),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000003', 'Wig revamp',               'Wash, condition and restyle your wig.',                    8000,  null,  90, 0,    false, 4),
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000004', 'Starter locs',             'Comb coils or two-strand starter locs.',                  25000, 40000, 240, 5000, false, 1),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000004', 'Loc retwist',              'Retwist and simple style.',                               10000, 15000, 120, 0,    false, 2),
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000005', 'Relaxer + styling',        'Retouch relaxer, treatment and style.',                    8000, 12000,  90, 0,    false, 1),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000005', 'Deep conditioning',        'Steam treatment for strong, soft hair.',                   6000,  null,  60, 0,    false, 2),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000005', 'Silk press',               'Wash, blow-dry and silk press.',                          10000, 15000,  90, 0,    false, 3),
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000006', 'Twist out',                'Two-strand twists set for a defined twist out.',           7000, 10000,  90, 0,    false, 1),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000006', 'Threading',                'African threading, any pattern.',                          4000,  6000,  60, 0,    false, 2),
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000007', 'Kids braids',              'Braids for ages 3–12, with beads on request.',            10000, 18000, 150, 2000, false, 1),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-4000-8000-000000000007', 'Kids cornrows',            'Simple cornrows for little ones.',                         4000,  7000,  60, 0,    false, 2);

insert into stylists (id, name, bio, specialties, sort) values
  ('00000000-0000-4000-8000-000000000901', 'Aisha',    'Braids specialist with 8 years of experience.', '{Braids,Kids}',          1),
  ('00000000-0000-4000-8000-000000000902', 'Blessing', 'Wig installs, frontals and silk presses.',      '{"Weaves & Wigs",Treatments}', 2),
  ('00000000-0000-4000-8000-000000000903', 'Funmi',    'Locs, natural hair and cornrows.',              '{Locs,"Natural Hair",Cornrows}', 3);

insert into opening_hours (weekday, opens, closes, closed) values
  (0, '13:00', '18:00', false),
  (1, '08:00', '19:00', false),
  (2, '08:00', '19:00', false),
  (3, '08:00', '19:00', false),
  (4, '08:00', '19:00', false),
  (5, '08:00', '19:00', false),
  (6, '08:00', '19:00', false);

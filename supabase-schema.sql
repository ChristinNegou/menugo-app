-- ========================
-- TABLES
-- ========================

create table if not exists user_profiles (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  category text[],
  address text not null,
  city text not null,
  phone text,
  email text,
  cover_image_url text,
  logo_url text,
  rating decimal(3,2) default 0,
  review_count integer default 0,
  prep_time_min integer default 15,
  price_range integer default 2,
  is_open boolean default true,
  opening_hours jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists menu_categories (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order integer default 0
);

create table if not exists menu_items (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id),
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  is_popular boolean default false,
  is_vegetarian boolean default false,
  is_gluten_free boolean default false,
  is_available boolean default true,
  sort_order integer default 0
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references auth.users,
  restaurant_id uuid references restaurants(id),
  status text default 'received',
  items jsonb not null,
  subtotal decimal(10,2) not null,
  tps decimal(10,2) not null,
  tvq decimal(10,2) not null,
  total decimal(10,2) not null,
  pickup_time timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, restaurant_id)
);

-- ========================
-- RLS
-- ========================

alter table user_profiles enable row level security;
alter table restaurants enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table favorites enable row level security;

-- user_profiles
create policy "Users can read own profile" on user_profiles for select to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- restaurants (public read)
create policy "Public can read restaurants" on restaurants for select using (true);

-- menu_categories (public read)
create policy "Public can read menu categories" on menu_categories for select using (true);

-- menu_items (public read)
create policy "Public can read menu items" on menu_items for select using (true);

-- orders
create policy "Users can read own orders" on orders for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert orders" on orders for insert to authenticated with check (auth.uid() = user_id);
create policy "Anon can insert orders" on orders for insert to anon with check (true);
create policy "Users can update own orders" on orders for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Service role can update all orders" on orders for update using (auth.jwt() ->> 'role' = 'service_role');

-- favorites
create policy "Users can manage own favorites" on favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========================
-- TRIGGER: auto-create user_profile
-- ========================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_profiles (id, first_name, last_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ========================
-- DEMO DATA — Restaurants
-- ========================

insert into restaurants (id, name, slug, description, category, address, city, phone, rating, review_count, prep_time_min, price_range, is_open, opening_hours) values
(
  'a1000000-0000-0000-0000-000000000001',
  'Chez Gilles — Poutinerie',
  'chez-gilles',
  'La meilleure poutine de Trois-Rivières depuis 1987. Sauce brune maison, fromage en grains frais du jour.',
  ARRAY['Poutine', 'Québécois'],
  '1234 rue des Forges', 'Trois-Rivières', '(819) 555-0101',
  4.8, 312, 12, 1, true,
  '{"monday":{"open":"10:00","close":"22:00"},"tuesday":{"open":"10:00","close":"22:00"},"wednesday":{"open":"10:00","close":"22:00"},"thursday":{"open":"10:00","close":"22:00"},"friday":{"open":"10:00","close":"23:00"},"saturday":{"open":"10:00","close":"23:00"},"sunday":{"open":"11:00","close":"21:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Sushi Mauricie',
  'sushi-mauricie',
  'Sushis frais préparés à la commande. Rolls créatifs inspirés du Québec.',
  ARRAY['Sushi', 'Japonais'],
  '567 boul. des Récollets', 'Trois-Rivières', '(819) 555-0202',
  4.6, 187, 20, 3, true,
  '{"monday":{"open":"11:30","close":"21:00"},"tuesday":{"open":"11:30","close":"21:00"},"wednesday":{"open":"11:30","close":"21:00"},"thursday":{"open":"11:30","close":"21:30"},"friday":{"open":"11:30","close":"22:00"},"saturday":{"open":"12:00","close":"22:00"},"sunday":{"open":"12:00","close":"20:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000003',
  'La Bonne Bouffe Burger',
  'la-bonne-bouffe-burger',
  'Burgers artisanaux avec boeuf local, pains briochés maison et frites fraîches.',
  ARRAY['Burgers', 'Américain'],
  '890 rue Hart', 'Trois-Rivières', '(819) 555-0303',
  4.5, 241, 15, 2, true,
  '{"monday":{"open":"11:00","close":"22:00"},"tuesday":{"open":"11:00","close":"22:00"},"wednesday":{"open":"11:00","close":"22:00"},"thursday":{"open":"11:00","close":"22:00"},"friday":{"open":"11:00","close":"23:00"},"saturday":{"open":"11:00","close":"23:00"},"sunday":{"open":"11:00","close":"21:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Pizza Express Trois-Rivières',
  'pizza-express',
  'Pizzas cuites au four à bois. Pâte fraîche tous les jours, ingrédients locaux.',
  ARRAY['Pizza', 'Italien'],
  '321 rue Saint-Maurice', 'Trois-Rivières', '(819) 555-0404',
  4.3, 156, 18, 2, true,
  '{"monday":{"open":"11:00","close":"22:00"},"tuesday":{"open":"11:00","close":"22:00"},"wednesday":{"open":"11:00","close":"22:00"},"thursday":{"open":"11:00","close":"22:00"},"friday":{"open":"11:00","close":"23:00"},"saturday":{"open":"11:00","close":"23:00"},"sunday":{"open":"12:00","close":"21:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000005',
  'Taqueria El Québec',
  'taqueria-el-quebec',
  'Tacos et burritos inspirés du Mexique, avec une touche québécoise. Tout fait à la main.',
  ARRAY['Mexicain', 'Tacos'],
  '654 rue Notre-Dame', 'Trois-Rivières', '(819) 555-0505',
  4.4, 98, 10, 1, true,
  '{"monday":{"open":"11:00","close":"21:00"},"tuesday":{"open":"11:00","close":"21:00"},"wednesday":{"open":"11:00","close":"21:00"},"thursday":{"open":"11:00","close":"21:00"},"friday":{"open":"11:00","close":"22:00"},"saturday":{"open":"11:00","close":"22:00"},"sunday":{"open":"12:00","close":"20:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000006',
  'Le Déjeuner Fleuri',
  'le-dejeuner-fleuri',
  'Déjeuners copieux et brunchs du dimanche. Ouvert dès 7h, toute la semaine.',
  ARRAY['Déjeuner', 'Brunch'],
  '111 rue Laviolette', 'Trois-Rivières', '(819) 555-0606',
  4.7, 203, 10, 2, true,
  '{"monday":{"open":"07:00","close":"15:00"},"tuesday":{"open":"07:00","close":"15:00"},"wednesday":{"open":"07:00","close":"15:00"},"thursday":{"open":"07:00","close":"15:00"},"friday":{"open":"07:00","close":"15:00"},"saturday":{"open":"07:00","close":"16:00"},"sunday":{"open":"08:00","close":"16:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000007',
  'Green Bowl',
  'green-bowl',
  'Bols santé, salades généreuses et smoothies frais. Végé, végan et sans gluten disponibles.',
  ARRAY['Végétarien', 'Santé', 'Végan'],
  '789 rue Champflour', 'Trois-Rivières', '(819) 555-0707',
  4.5, 134, 12, 2, true,
  '{"monday":{"open":"10:00","close":"20:00"},"tuesday":{"open":"10:00","close":"20:00"},"wednesday":{"open":"10:00","close":"20:00"},"thursday":{"open":"10:00","close":"20:00"},"friday":{"open":"10:00","close":"20:00"},"saturday":{"open":"10:00","close":"18:00"},"sunday":{"open":"11:00","close":"17:00"}}'::jsonb
),
(
  'a1000000-0000-0000-0000-000000000008',
  'Le P''tit Poulet',
  'le-ptit-poulet',
  'Poulet rôti à la broche, côtes levées et ailes de poulet. La spécialité : sauce BBQ maison.',
  ARRAY['Poulet', 'BBQ'],
  '432 boul. Gene-H.-Kruger', 'Trois-Rivières', '(819) 555-0808',
  4.2, 89, 20, 2, false,
  '{"monday":{"open":"11:00","close":"21:00"},"tuesday":{"open":"11:00","close":"21:00"},"wednesday":{"open":"11:00","close":"21:00"},"thursday":{"open":"11:00","close":"21:00"},"friday":{"open":"11:00","close":"22:00"},"saturday":{"open":"11:00","close":"22:00"},"sunday":{"open":"12:00","close":"20:00"}}'::jsonb
)
on conflict (slug) do nothing;

-- ========================
-- DEMO DATA — Menu categories & items
-- ========================

-- Chez Gilles
with r as (select id from restaurants where slug='chez-gilles')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Classiques', 0), ('Spéciaux', 1), ('Boissons', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='chez-gilles'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='chez-gilles') and name='Classiques'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='chez-gilles') and name='Spéciaux')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, true, ord from r, c1, (values
  ('Poutine classique', 'Frites croustillantes, fromage en grains frais, sauce brune maison', 9.99, true, 0),
  ('Poutine italienne', 'Sauce à spaghetti, boeuf haché, fromage en grains', 12.99, false, 1),
  ('Frites maison', 'Frites coupées à la main, assaisonnées', 5.99, false, 2)
) as t(item, desc_, price_, pop, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, true, ord from r, c2, (values
  ('Poutine au pulled pork', 'Effiloché de porc BBQ, oignons caramélisés, sauce brune', 14.99, true, 0),
  ('Poutine végé', 'Champignons, poivrons, oignons, fromage en grains', 11.99, false, 1),
  ('Pogos maison', '2 pogos avec sauce au choix', 7.99, false, 2)
) as t(item, desc_, price_, pop, ord)
on conflict do nothing;

-- Sushi Mauricie
with r as (select id from restaurants where slug='sushi-mauricie')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Maki', 0), ('Sashimi', 1), ('Spéciaux', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='sushi-mauricie'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='sushi-mauricie') and name='Maki'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='sushi-mauricie') and name='Spéciaux')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, true, ord from r, c1, (values
  ('California Roll (8 pcs)', 'Crabe imitation, avocat, concombre', 10.99, true, 0),
  ('Spicy Salmon Roll (8 pcs)', 'Saumon, mayo épicée, oignon vert', 12.99, true, 1),
  ('Dragon Roll (8 pcs)', 'Crevettes tempura, avocat, sauce anguille', 15.99, false, 2),
  ('Maki Saumon (6 pcs)', 'Saumon frais, riz vinaigré', 8.99, false, 3)
) as t(item, desc_, price_, pop, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, true, ord from r, c2, (values
  ('Combo 30 pcs', 'Assortiment de maki et nigiri pour 2', 39.99, true, 0),
  ('Bol chirashi', 'Riz, sashimi assorti, légumes marinés', 18.99, false, 1),
  ('Edamame', 'Fèves de soya salées, servies chaudes', 4.99, false, 2)
) as t(item, desc_, price_, pop, ord)
on conflict do nothing;

-- La Bonne Bouffe Burger
with r as (select id from restaurants where slug='la-bonne-bouffe-burger')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Burgers', 0), ('Accompagnements', 1), ('Boissons', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='la-bonne-bouffe-burger'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='la-bonne-bouffe-burger') and name='Burgers'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='la-bonne-bouffe-burger') and name='Accompagnements')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_gluten_free, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, gf, true, ord from r, c1, (values
  ('Le Classique', 'Boeuf AAA, laitue, tomate, oignons, cornichon, mayo', 13.99, true, false, 0),
  ('Le Bacon Suisse', 'Boeuf AAA, bacon croustillant, fromage suisse, sauce BBQ', 15.99, true, false, 1),
  ('Le Végé', 'Galette de pois chiches, avocat, roquette, sauce tahini', 12.99, false, true, 2),
  ('Double Smash', 'Double galette smashée, fromage américain, sauce secrète', 17.99, true, false, 3)
) as t(item, desc_, price_, pop, gf, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, gf, true, ord from r, c2, (values
  ('Frites maison', 'Pommes de terre fraîches, fleur de sel', 4.99, false, true, 0),
  ('Poutine du burger', 'Frites, sauce du jour, fromage en grains', 7.99, true, false, 1),
  ('Rondelles d''oignon', 'Croustillantes, sauce ranch maison', 5.99, false, false, 2)
) as t(item, desc_, price_, pop, gf, ord)
on conflict do nothing;

-- Pizza Express
with r as (select id from restaurants where slug='pizza-express')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Pizzas', 0), ('Pâtes', 1), ('Desserts', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='pizza-express'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='pizza-express') and name='Pizzas'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='pizza-express') and name='Pâtes')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_vegetarian, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, veg, true, ord from r, c1, (values
  ('Margherita', 'Tomate San Marzano, mozzarella fior di latte, basilic frais', 14.99, true, true, 0),
  ('Pepperoni', 'Pepperoni tranché, fromage double, sauce tomate', 15.99, true, false, 1),
  ('4 Fromages', 'Mozzarella, gorgonzola, provolone, parmesan', 16.99, false, true, 2),
  ('Végétarienne', 'Poivrons, champignons, olives, courgettes, feta', 15.99, false, true, 3),
  ('BBQ Poulet', 'Poulet grillé, sauce BBQ, oignons rouges, coriandre', 16.99, false, false, 4)
) as t(item, desc_, price_, pop, veg, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, veg, true, ord from r, c2, (values
  ('Penne arrabbiata', 'Sauce tomate épicée, ail, persil', 12.99, false, true, 0),
  ('Spaghetti bolognese', 'Sauce bolognaise maison, parmesan', 13.99, true, false, 1)
) as t(item, desc_, price_, pop, veg, ord)
on conflict do nothing;

-- Taqueria El Québec
with r as (select id from restaurants where slug='taqueria-el-quebec')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Tacos', 0), ('Burritos', 1), ('Extras', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='taqueria-el-quebec'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='taqueria-el-quebec') and name='Tacos'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='taqueria-el-quebec') and name='Burritos')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_vegetarian, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, veg, true, ord from r, c1, (values
  ('Taco al pastor (3)', 'Porc mariné, ananas, coriandre, salsa verde', 9.99, true, false, 0),
  ('Taco boeuf (3)', 'Boeuf épicé, oignons, coriandre, guacamole', 9.99, true, false, 1),
  ('Taco végé (3)', 'Champignons portobello, poivrons, black beans, avocat', 8.99, false, true, 2)
) as t(item, desc_, price_, pop, veg, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, veg, true, ord from r, c2, (values
  ('Burrito poulet', 'Poulet grillé, riz, haricots, fromage, crème sure', 12.99, true, false, 0),
  ('Burrito végé', 'Black beans, riz, guacamole, maïs, fromage', 11.99, false, true, 1)
) as t(item, desc_, price_, pop, veg, ord)
on conflict do nothing;

-- Le Déjeuner Fleuri
with r as (select id from restaurants where slug='le-dejeuner-fleuri')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Déjeuners', 0), ('Brunch', 1), ('Boissons', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='le-dejeuner-fleuri'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='le-dejeuner-fleuri') and name='Déjeuners'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='le-dejeuner-fleuri') and name='Brunch')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_vegetarian, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, veg, true, ord from r, c1, (values
  ('Assiette complète', '3 oeufs, bacon, rôtie, fèves au lard, patates', 12.99, true, false, 0),
  ('Crêpes aux bleuets', '3 crêpes moelleuses, sirop d''érable, bleuets frais', 10.99, true, true, 1),
  ('Omelette du chef', 'Fromage, jambon, champignons, poivrons', 11.99, false, false, 2),
  ('Gruau aux pommes', 'Gruau crémeux, pommes sautées, cannelle, érable', 7.99, false, true, 3)
) as t(item, desc_, price_, pop, veg, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, veg, true, ord from r, c2, (values
  ('Eggs Benedict', 'Muffin anglais, jambon, oeuf poché, hollandaise maison', 14.99, true, false, 0),
  ('Bol acai', 'Purée d''acai, granola, banane, fraises, miel', 11.99, false, true, 1),
  ('Sandwich déjeuner', 'Bagel, oeuf brouillé, bacon, fromage', 9.99, false, false, 2)
) as t(item, desc_, price_, pop, veg, ord)
on conflict do nothing;

-- Green Bowl
with r as (select id from restaurants where slug='green-bowl')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Bols', 0), ('Salades', 1), ('Smoothies', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='green-bowl'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='green-bowl') and name='Bols'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='green-bowl') and name='Salades')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_vegetarian, is_gluten_free, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, veg, gf, true, ord from r, c1, (values
  ('Buddha Bowl', 'Quinoa, pois chiches rôtis, avocat, légumes de saison, tahini', 14.99, true, true, true, 0),
  ('Bowl protéiné', 'Riz brun, tempeh, edamame, carottes, sauce sésame', 13.99, true, true, true, 1),
  ('Bowl méditerranéen', 'Couscous, houmous, tabulé, olives, feta', 12.99, false, true, false, 2)
) as t(item, desc_, price_, pop, veg, gf, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, veg, gf, true, ord from r, c2, (values
  ('Salade César végé', 'Romaine, croûtons maison, parmesan végé, sauce César', 11.99, false, true, false, 0),
  ('Salade de quinoa', 'Quinoa, concombre, tomates cerises, menthe, citron', 10.99, true, true, true, 1)
) as t(item, desc_, price_, pop, veg, gf, ord)
on conflict do nothing;

-- Le P'tit Poulet
with r as (select id from restaurants where slug='le-ptit-poulet')
insert into menu_categories (id, restaurant_id, name, sort_order)
select gen_random_uuid(), r.id, cat, ord from r, (values ('Poulet rôti', 0), ('Ailes', 1), ('Accompagnements', 2)) as t(cat, ord)
on conflict do nothing;

with r as (select id from restaurants where slug='le-ptit-poulet'),
     c1 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='le-ptit-poulet') and name='Poulet rôti'),
     c2 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='le-ptit-poulet') and name='Ailes'),
     c3 as (select id from menu_categories where restaurant_id=(select id from restaurants where slug='le-ptit-poulet') and name='Accompagnements')
insert into menu_items (restaurant_id, category_id, name, description, price, is_popular, is_available, sort_order)
select r.id, c1.id, item, desc_, price_, pop, true, ord from r, c1, (values
  ('Demi-poulet rôti', 'Poulet fermier rôti à la broche, sauce BBQ maison', 14.99, true, 0),
  ('Poulet entier', 'Poulet fermier rôti, deux sauces au choix', 26.99, false, 1)
) as t(item, desc_, price_, pop, ord)
union all
select r.id, c2.id, item, desc_, price_, pop, true, ord from r, c2, (values
  ('Ailes classiques (12)', 'Sauce buffalo ou BBQ, sauce ranch', 16.99, true, 0),
  ('Ailes honey garlic (12)', 'Sauce miel-ail, oignons verts', 17.99, true, 1)
) as t(item, desc_, price_, pop, ord)
union all
select r.id, c3.id, item, desc_, price_, pop, true, ord from r, c3, (values
  ('Frites assaisonnées', 'Paprika fumé, sel de mer', 4.99, false, 0),
  ('Coleslaw maison', 'Chou, carottes, vinaigrette crémeuse', 3.99, false, 1),
  ('Épi de maïs grillé', 'Beurre à l''ail, herbes fraîches', 3.49, false, 2)
) as t(item, desc_, price_, pop, ord)
on conflict do nothing;

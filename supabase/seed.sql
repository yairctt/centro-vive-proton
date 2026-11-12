-- =============================================================================
-- Pulso Jarocho · Datos Semilla para Demostración (Seed Demo)
-- Integrante 3 (feat/backend)
-- Reto 6 · Centro vivo (Turismo y Centro Histórico de Veracruz)
-- =============================================================================

-- 1. Limpieza de datos temporales / pruebas
DELETE FROM places WHERE name LIKE 'QA_TEST%';
DELETE FROM places WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000018'
);

-- 2. Perfiles demo del sistema
INSERT INTO profiles (id, alias, role, points) VALUES
  ('11111111-1111-1111-1111-111111111111', 'visitante-demo', 'visitante', 120),
  ('22222222-2222-2222-2222-222222222222', 'comercio-demo', 'comercio', 0),
  ('33333333-3333-3333-3333-333333333333', 'admin-demo', 'admin', 0)
ON CONFLICT (id) DO UPDATE SET
  alias = EXCLUDED.alias,
  role = EXCLUDED.role,
  points = EXCLUDED.points;

-- 3. Lugares del Centro Histórico de Veracruz (12 emblemáticos + 6 comercios ficticios)
-- verified = false y opens_at/closes_at = null (sin horarios inventados, salvo los nocturnos explícitos)
-- opportunity más alta en comercios pequeños para favorecer la dispersión turística.
INSERT INTO places (id, name, category, lat, lng, description, opens_at, closes_at, avg_visit_min, price_level, opportunity, verified, meta) VALUES
  -- 12 Lugares emblemáticos del Centro Histórico
  ('00000000-0000-0000-0000-000000000001', 'Zócalo de Veracruz (Plaza de Armas)', 'historia', 19.2001, -96.1384, 'Corazón social e histórico del puerto jarocho, rodeado de palmeras, portales coloniales y danzón tradicional.', NULL, NULL, 30, 'bajo', 0.35, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'Catedral de Veracruz (Nuestra Señora de la Asunción)', 'historia', 19.1998, -96.1386, 'Emblemático templo neoclásico del siglo XVIII edificado en piedra múcara y cantera rosa frente al Zócalo.', NULL, NULL, 25, 'bajo', 0.30, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'Palacio Municipal de Veracruz', 'historia', 19.2006, -96.1385, 'Histórica sede del primer ayuntamiento fundado en la América continental, con arquitectura toscana.', NULL, NULL, 20, 'bajo', 0.35, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'Los Portales de Lerdo', 'paseo', 19.2003, -96.1389, 'Corredor tradicional de convivencia porteña, marimbas en vivo, tertulias y gastronomía veracruzana.', NULL, NULL, 45, 'medio', 0.40, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000005', 'Malecón de Veracruz', 'paseo', 19.2025, -96.1345, 'Amplio paseo marítimo con vistas al canal de navegación, buques de carga, saca-monedas y brisa del Golfo.', NULL, NULL, 40, 'bajo', 0.30, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000006', 'Faro Venustiano Carranza', 'cultura', 19.2018, -96.1338, 'Majestuoso faro y edificio de arquitectura neoclásica que albergó los poderes de la nación en 1915.', NULL, NULL, 25, 'bajo', 0.45, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000007', 'Museo de la Ciudad de Veracruz', 'cultura', 19.1975, -96.1378, 'Antiguo hospicio neoclásico que resguarda la rica historia de la cuatro veces heroica ciudad y puerto.', NULL, NULL, 50, 'bajo', 0.50, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000008', 'Callejón del Diamante', 'paseo', 19.1989, -96.1396, 'Rincón colonial empedrado lleno de leyendas urbanas del virreinato, atmósfera bohemia y arte callejero.', NULL, NULL, 20, 'bajo', 0.60, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000009', 'Gran Café del Portal', 'gastronomia', 19.2002, -96.1391, 'Cuna centenaria del café lechero servido al sonar de la cuchara sobre el vaso de cristal.', NULL, NULL, 40, 'medio', 0.40, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000010', 'Mercado Hidalgo', 'compras', 19.1945, -96.1402, 'Centro neurálgico del comercio popular veracruzano con puestos de antojitos, frutas locales y artesanías.', NULL, NULL, 35, 'bajo', 0.65, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000011', 'Baluarte de Santiago', 'historia', 19.1956, -96.1342, 'Único sobreviviente del sistema defensivo amurallado del siglo XVII que protegía al puerto.', NULL, NULL, 30, 'bajo', 0.55, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000012', 'Recinto de la Reforma', 'historia', 19.1982, -96.1368, 'Antiguo convento franciscano donde Benito Juárez promulgó las históricas Leyes de Reforma en 1859.', NULL, NULL, 30, 'bajo', 0.50, FALSE, '{}'::jsonb),

  -- 6 Comercios FICTICIOS (alta oportunidad, categorías gastronomía y compras)
  -- 2 con abreDeNoche = true y closes_at = '22:00:00'
  ('00000000-0000-0000-0000-000000000013', 'Antojitos La Jarocha Alegre', 'gastronomia', 19.2008, -96.1378, 'Picadas con salsa de chile comapeño, gorditas negras de frijol y café de olla en cazuela de barro.', NULL, NULL, 25, 'bajo', 0.85, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000014', 'Café y Toritos La Bamba Nocturna', 'gastronomia', 19.2012, -96.1368, 'Bebidas espirituosas artesanales (toritos de cacahuate y guanábana) y café de especialidad con son en vivo.', NULL, '22:00:00', 35, 'medio', 0.90, FALSE, '{"abreDeNoche": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000015', 'Mariscos El Puerto Bravo', 'gastronomia', 19.2019, -96.1352, 'Ceviches jarochos, vuelve a la vida y cazuelas de mariscos recién capturados por pescadores locales.', NULL, '22:00:00', 40, 'medio', 0.85, FALSE, '{"abreDeNoche": true}'::jsonb),
  ('00000000-0000-0000-0000-000000000016', 'Artesanías El Coral Blanco', 'compras', 19.2022, -96.1358, 'Figuras talladas en madera, conchas marinas, abanicos pintados a mano y textiles de la Cuenca.', NULL, NULL, 20, 'bajo', 0.75, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000017', 'Guayaberas y Sombreros El Danzón', 'compras', 19.1994, -96.1380, 'Tradicionales prendas de lino para lucir en las plazas y sombreros de jipi tejidos artesanalmente.', NULL, NULL, 25, 'medio', 0.70, FALSE, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000018', 'Dulcería y Nieves Doña Gloria', 'gastronomia', 19.1991, -96.1387, 'Nieves de garrafa (guanábana, zapote, coco) y dulces típicos veracruzanos (duquesas y glorias).', NULL, NULL, 15, 'bajo', 0.80, FALSE, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  description = EXCLUDED.description,
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  avg_visit_min = EXCLUDED.avg_visit_min,
  price_level = EXCLUDED.price_level,
  opportunity = EXCLUDED.opportunity,
  verified = EXCLUDED.verified,
  meta = EXCLUDED.meta;

-- 4. Registro de negocios asociados a los 6 comercios ficticios
INSERT INTO businesses (id, place_id, owner_id, contact, active, meta) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', '22222222-2222-2222-2222-222222222222', 'contacto@antojitos-jarocha.demo.mx', TRUE, '{}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222222', 'gerencia@bambanocturna.demo.mx', TRUE, '{"abreDeNoche": true}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000015', '22222222-2222-2222-2222-222222222222', 'reservas@puertobravo.demo.mx', TRUE, '{"abreDeNoche": true}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000016', '22222222-2222-2222-2222-222222222222', 'artesanias@coralblanco.demo.mx', TRUE, '{}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000017', '22222222-2222-2222-2222-222222222222', 'ventas@guayaberasdanzon.demo.mx', TRUE, '{}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000018', '22222222-2222-2222-2222-222222222222', 'dulceria@nievesdonagloria.demo.mx', TRUE, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  place_id = EXCLUDED.place_id,
  owner_id = EXCLUDED.owner_id,
  contact = EXCLUDED.contact,
  active = EXCLUDED.active,
  meta = EXCLUDED.meta;

-- 5. 4 Eventos de demo (source 'demo'): hoy y mañana, uno a las 20:00 hrs
INSERT INTO events (id, place_id, title, category, starts_at, ends_at, source, verified, meta) VALUES
  -- Evento 1: Hoy a las 18:00 hrs en el Zócalo
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Tarde de Danzón y Marimba en el Zócalo', 'cultura',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '18 hours') AT TIME ZONE 'America/Mexico_City',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '19 hours 30 minutes') AT TIME ZONE 'America/Mexico_City',
   'demo', FALSE, '{}'::jsonb),

  -- Evento 2: Hoy a las 20:00 hrs en Los Portales (evento nocturno clave)
  ('eeeeeeee-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Noche Jarocha de Fandango en los Portales', 'cultura',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '20 hours') AT TIME ZONE 'America/Mexico_City',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '22 hours 30 minutes') AT TIME ZONE 'America/Mexico_City',
   'demo', FALSE, '{"nocturno": true}'::jsonb),

  -- Evento 3: Mañana a las 11:00 hrs en el Recinto de la Reforma
  ('eeeeeeee-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'Visita Guiada: Historia y Leyes de Reforma', 'historia',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '1 day 11 hours') AT TIME ZONE 'America/Mexico_City',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '1 day 12 hours 30 minutes') AT TIME ZONE 'America/Mexico_City',
   'demo', FALSE, '{}'::jsonb),

  -- Evento 4: Mañana a las 19:00 hrs en el Malecón
  ('eeeeeeee-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'Serenata Porteña frente a la Bahía', 'paseo',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '1 day 19 hours') AT TIME ZONE 'America/Mexico_City',
   ((now() AT TIME ZONE 'America/Mexico_City')::date + interval '1 day 20 hours 30 minutes') AT TIME ZONE 'America/Mexico_City',
   'demo', FALSE, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  place_id = EXCLUDED.place_id,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  source = EXCLUDED.source,
  verified = EXCLUDED.verified,
  meta = EXCLUDED.meta;

-- 6. 3 Misiones de demostración (una con night_bonus = true)
INSERT INTO missions (id, place_id, title, description, points, night_bonus, active) VALUES
  ('ca000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'El Secreto del Lechero', 'Visita el Gran Café del Portal y degusta un lechero servido al sonar de la canilla.', 50, FALSE, TRUE),
  ('ca000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000014', 'Noche de Sabor y Torito Jarocho', 'Visita La Bamba Nocturna después de las 19:00 hrs y prueba un torito artesanal.', 80, TRUE, TRUE),
  ('ca000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'Guardián del Baluarte', 'Explora el Baluarte de Santiago y admira el último fragmento de la muralla virreinal.', 60, FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  place_id = EXCLUDED.place_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  night_bonus = EXCLUDED.night_bonus,
  active = EXCLUDED.active;

-- 7. 3 Recompensas vinculadas a comercios participantes
INSERT INTO rewards (id, business_id, title, conditions, cost_points, valid_until) VALUES
  ('da000000-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000014', '2x1 en Torito tradicional de cacahuate', 'Válido en horario nocturno (19:00 a 22:00 hrs). 1 por usuario.', 100, NULL),
  ('da000000-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000013', 'Orden de picadas jarochas de cortesía', 'En la compra de cualquier bebida de la casa.', 80, NULL),
  ('da000000-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000016', '15% de descuento en artesanías marinas', 'Válido en compras mínimas de $150 mostrando tu pasaporte digital.', 60, NULL)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  title = EXCLUDED.title,
  conditions = EXCLUDED.conditions,
  cost_points = EXCLUDED.cost_points,
  valid_until = EXCLUDED.valid_until;

-- 8. Generación de QR tokens (un token por cada lugar registrado)
DELETE FROM qr_tokens;
INSERT INTO qr_tokens (place_id)
SELECT id FROM places;


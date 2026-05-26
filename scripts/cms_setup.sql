-- =============================================================
-- CMS COMPLETO — Valentina Centeno
-- Pega TODO este bloque en Supabase → SQL Editor → New query → Run
-- =============================================================

-- ============================================
-- TABLA cms_textos
-- ============================================
create table if not exists public.cms_textos (
  id uuid primary key default gen_random_uuid(),
  seccion text not null,
  clave text not null,
  valor text,
  updated_at timestamptz not null default now(),
  unique (seccion, clave)
);

alter table public.cms_textos enable row level security;

drop policy if exists "Anon leer cms_textos" on public.cms_textos;
create policy "Anon leer cms_textos" on public.cms_textos
  for select to anon using (true);

drop policy if exists "Anon insertar cms_textos" on public.cms_textos;
create policy "Anon insertar cms_textos" on public.cms_textos
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_textos" on public.cms_textos;
create policy "Anon actualizar cms_textos" on public.cms_textos
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_textos" on public.cms_textos;
create policy "Anon eliminar cms_textos" on public.cms_textos
  for delete to anon using (true);

-- Seed ABOUT (solo si no existe ya en cms_textos)
insert into public.cms_textos (seccion, clave, valor)
select * from (values
  ('about', 'title', '¡HOLA, SOY VALENTINA CENTENO!'),
  ('about', 'p1', 'Soy asambleísta del Ecuador y, ante todo, una mujer que sueña con un país más justo. Creo profundamente en el poder de la educación, en los sueños de niñas, niños y jóvenes, y en la fuerza de las mujeres para transformar realidades.'),
  ('about', 'p2', 'Nací en Portoviejo, Manabí, donde aprendí a trabajar con humildad y propósito. Fui abanderada, deportista de élite en vóley y becaria en la Universidad San Francisco de Quito, donde me gradué Summa Cum Laude en Derecho.'),
  ('about', 'video', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/IMG_8631.mp4')
) as t(seccion, clave, valor)
where not exists (select 1 from public.cms_textos where seccion='about');

-- Seed FORMACION
insert into public.cms_textos (seccion, clave, valor)
select * from (values
  ('formacion', 'fd_titulo_1', 'PARA LOS JÓVENES'),
  ('formacion', 'fd_titulo_2', 'LEY DE FORMACIÓN DUAL Y TÉCNICA'),
  ('formacion', 'fd_descripcion', 'Con la Ley de Formación Dual y Técnica los jóvenes estudian en aulas y empresas; desde el primer momento de su carrera tienen experiencia real mientras se forman. Así reducimos el subempleo y conectamos la educación con oportunidades reales de trabajo. Que nunca más te digan “no tienes experiencia”, porque con la formación dual y técnica la experiencia viene incluida.'),
  ('formacion', 'fd_galeria', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/IMG_3401.webp, https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/PHOTO-2025-10-20-15-47-25.webp, https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/PHOTO-2025-10-20-16-10-58.webp, https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/IMG_3326.webp, https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/DSC00930.webp'),
  ('formacion', 'fd_video', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/02/IMG_2007.mov'),
  ('formacion', 'fd_ficha_titulo_1', 'CON ESTA LEY'),
  ('formacion', 'fd_ficha_titulo_2', 'GANAN LOS JÓVENES'),
  ('formacion', 'fd_beneficio_1', 'Oportunidades de empleo al finalizar la carrera.'),
  ('formacion', 'fd_beneficio_2', 'Se forma talento en lo que el país realmente necesita.'),
  ('formacion', 'fd_btn_principal', 'CONOCE LAS UNIVERSIDADES E INSTITUTOS'),
  ('formacion', 'fd_btn_secundario', NULL)
) as t(seccion, clave, valor)
where not exists (select 1 from public.cms_textos where seccion='formacion');

-- Seed INICIATIVAS
insert into public.cms_textos (seccion, clave, valor)
select * from (values
  ('iniciativas', 'id', '1.0'),
  ('iniciativas', 'sectionTitle', 'Ley de Formación Dual y Técnica: Aprender haciendo'),
  ('iniciativas', 'description', 'Con la Ley de Formación Dual y Técnica trabajamos para transformar la manera en que los jóvenes se preparan para el mundo laboral. 

Esta normativa une a estudiantes, institutos, universidades y empresas, permitiendo que la formación combine aulas y práctica real en los lugares de trabajo. 

Nuestro objetivo es abrir más oportunidades de empleo, reducir el subempleo y garantizar que los jóvenes estudien lo que el país necesita, con una educación que les permita construir su futuro con libertad y oportunidades reales.')
) as t(seccion, clave, valor)
where not exists (select 1 from public.cms_textos where seccion='iniciativas');

-- ============================================
-- TABLA cms_leyes
-- ============================================
create table if not exists public.cms_leyes (
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  title_top text,
  title text,
  img text,
  descripcion text,
  full_text text,
  section_title text,
  section_subtitle text,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.cms_leyes enable row level security;

drop policy if exists "Anon leer cms_leyes" on public.cms_leyes;
create policy "Anon leer cms_leyes" on public.cms_leyes
  for select to anon using (true);

drop policy if exists "Anon insertar cms_leyes" on public.cms_leyes;
create policy "Anon insertar cms_leyes" on public.cms_leyes
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_leyes" on public.cms_leyes;
create policy "Anon actualizar cms_leyes" on public.cms_leyes
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_leyes" on public.cms_leyes;
create policy "Anon eliminar cms_leyes" on public.cms_leyes
  for delete to anon using (true);

-- Seed LEYES
insert into public.cms_leyes (orden, title_top, title, img, descripcion, full_text, section_title, section_subtitle, activo)
select * from (values
  (1, 'EMPLEO JOVEN', '59.902 jóvenes entre 18 y 29 años consiguieron trabajo', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-11-27-at-21.58.25.webp', 'Esto gracias a que establecimos una deducción adicional del 50% para el sector', 'Esto gracias a que establecimos una deducción adicional del 50% para el sector privado por la creación de nuevas plazas laborales para jóvenes.
Además, implementamos una deducción del 75% para instituciones públicas que contraten a jóvenes graduados o egresados de universidades e institutos públicos.
A esto se suma una deducción del 75% para nuevas plazas de empleo generadas en sectores clave como agricultura y construcción.
', '¡Lo que hemos logrado!', 'Como su representante en la Asamblea Nacional: 

..', true),
  (2, 'REMISIÓN DE IMPUESTO RIMPE', ' 186 mil negocios populares recibieron alivio tributario', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ALIVIO-FINANCIERO-BIESS.webp', 'Con la remisión  de impuestos para el régimen RIMPE – Negocio Popular, se permitió que...', 'Con la Ley de Alivio Financiero el BIES permitió la reestructuración o refinancimiento de créditos hipotecarios logrando que cientos de familias evitaran perder sus viviendas.

Se otorgaron 90 días de gracia sin intereses moratorios ni recargos y ya se han reestructurado más de USD 25 millones en créditos, es decir que 461 hogares recibieron el alivio que necesitaban para ponerse al día. 

La medida también permitió que 108 familias refinanciaran sus créditos, lo que representa 4 millones en alivio financiero.
', ' ', NULL, true),
  (3, 'REESTRUCTURACIÓN DE CRÉDITOS HIPOTECARIOS', 'Reestructuramos créditos hipotecarios y familias salvaron su vivienda', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/BIESS-CREDITOS-HIPOTECARIOS-.avif ', 'Con la Ley de Alivio Financiero el BIES permitió la reestructuración o refinancimiento de créditos hipotecarios...', 'Con la Ley de Alivio Financiero el BIES permitió la reestructuración o refinancimiento de créditos hipotecarios logrando que cientos de familias evitaran perder sus viviendas. 
Se otorgaron 90 días de gracia sin intereses moratorios ni recargos y ya se han reestructurado más de USD 25 millones en créditos, es decir que 461 hogares recibieron el alivio que necesitaban para ponerse al día. La medida también permitió que 108 familias refinanciaran sus créditos, lo que representa 4 millones en alivio financiero.

', ' ', NULL, true),
  (4, 'CONDONACIÓN DE DEUDAS DE LA BANCA CERRADA', 'Conseguimos que se condonaran deudas de la banca cerrada ', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/DEUDA-BANCA-CERRADA-2.webp', 'Tras años de arrastrar deudas originadas en el feriado bancario, 228 deudores de la banca cerrada...', 'Tras años de cargar con deudas originadas en el feriado bancario, 228 deudores de la banca cerrada recibieron un alivio real gracias a la Ley de Alivio Financiero, que aprobó la condonación total del capital hasta USD 10.000 y la condonación de intereses para deudas entre USD 10.000 y 50.000.
En total, 593 créditos fueron condonados: 
- 550 eran deudas menores a USD 10.000, que sumaban USD 2’054.588
- 43 eran procesos de reestructuración, cuyo capital ascendía a USD 858.000, se condonaron USD 690.000 en intereses.
', ' ', NULL, true),
  (5, 'REMISIÓN DE CRÉDTOS EDUCATIVOS', 'Más de 2.715 estudiantes recibieron alivio educativo', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/CREDITOS-EDUCATIVOS-.webp ', 'Más de 2.715 estudiantes y profesionales recibieron alivio financiero con la remisión total...', 'Más de 2.715 estudiantes y profesionales recibieron alivio financiero con la remisión total de intereses, recargos y multas de sus créditos educativos vencidos de la Senescyt. En total se perdonaron USD 11.5 millones, para que los beneficiarios puedan ponerse al día y seguir estudiando o trabajando sin deudas que les impedían avanzar.', NULL, NULL, true),
  (6, 'REMISIÓN DE INTERESES', 'Impulsamos alivio crediticio para emprendedores', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/54154217003_52d3dedb68_o.webp ', 'Dos leyes permitieron que miles de ecuatorianos reciban el perdón de intereses...', 'Dos leyes permitieron que miles de ecuatorianos reciban el perdón de intereses, multas y recargos de sus créditos productivos con BanEcuador y la CFN.
 En BanEcuador, 6.720 beneficiarios pudieron pagar el capital pendiente y acceder a la remisión de intereses, que suma más de USD 26 millones. En la CFN, la remisión de intereses llegó para 170 beneficiarios más, por un monto de USD 130 millones.
', NULL, NULL, true),
  (7, 'CREACIÓN DEL SERVICIO NACIONAL DE ÁREAS PROTEGIDAS', 'Nueva institución para proteger las áreas naturales del país', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/IMG_2564.webp ', 'Con la Ley de Fortalecimiento de Áreas Protegidas se creará el Servicio...', 'Con la Ley de Fortalecimiento de Áreas Protegidas creara el Servicio Nacional de Áreas Protegidas, una institución pública dedicada exclusivamente a cuidar, conservar y manejar los parques nacionales y reservas del Ecuador. 

Esta entidad permitirá una administración más técnica y eficiente, con personal especializado y recursos propios, para proteger la biodiversidad, evitar invasiones y garantizar la conservación de los ecosistemas que abastecen de agua, turismo y vida a miles de familias en todo el país.', NULL, NULL, true),
  (8, 'PROFESIONALIZACIÓN DE GUARDAPARQUES ', 'Guardaparques, ahora con formación y reconocimiento oficial', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/DSC07577.webp ', 'Quienes protegen los bosques, ríos y parques del país por fin reciben el reconocimiento que merecen...', 'Quienes protegen los bosques, ríos y parques del país por fin reciben el reconocimiento que merecen. 

La nueva Ley de Fortalecimiento de Áreas Protegidas fomenta que los guardaparques accedan a formación técnica y opciones de ascenso en el sector público. 

Gracias a esta normativa, 500 guardaparques ya han sido capacitados, fortaleciendo la conservación y la vigilancia de nuestros ecosistemas.', NULL, NULL, true),
  (9, 'DONACIONES A LA FAE Y POLICÍA', 'Empresas y ciudadanos donaron USD 749 mil para seguridad', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/b1510611-4d57-4d09-b609-3f25ef567137.webp ', 'En 2024, empresas y ciudadanos realizaron donaciones a la Policía Nacional y a las Fuerzas Armadas...', 'En 2024 empresas y ciudadanos realizaron donaciones a la Policía Nacional y a las Fuerzas Armadas, accediendo al beneficio que permite rebajar hasta el 30% del Impuesto a la Renta. 

En total, se registraron USD 749.000 en donaciones, recursos que fortalecen el trabajo y la seguridad que prestan estas instituciones en el país.', NULL, NULL, true),
  (10, 'EXTENCIÓN DE VIDA ÚTIL VEHICULAR', 'Conseguimos extender la vida útil del transporte público', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/IMG_3760.webp ', 'Para evitar que miles de transportistas tengan que cambiar sus unidades en plena crisis económica...', 'Para evitar que miles de transportistas tengan que cambiar sus unidades en plena crisis económica, se emitió un decreto que amplía por dos años la vida útil de los vehículos de transporte terrestre. 

La medida, impulsada por Valentina Centeno, da un respiro al sector, reduce costos y evita que los choferes enfrenten multas o la obligación inmediata de renovar sus unidades. 

Esta extensión beneficia a taxis, buses urbanos, interprovinciales y transporte pesado en todo el país.', NULL, NULL, true)
) as t(orden, title_top, title, img, descripcion, full_text, section_title, section_subtitle, activo)
where not exists (select 1 from public.cms_leyes);

-- ============================================
-- TABLA cms_logros
-- ============================================
create table if not exists public.cms_logros (
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  icon_key text,
  title text,
  body text,
  image text,
  section_title text,
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.cms_logros enable row level security;

drop policy if exists "Anon leer cms_logros" on public.cms_logros;
create policy "Anon leer cms_logros" on public.cms_logros
  for select to anon using (true);

drop policy if exists "Anon insertar cms_logros" on public.cms_logros;
create policy "Anon insertar cms_logros" on public.cms_logros
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_logros" on public.cms_logros;
create policy "Anon actualizar cms_logros" on public.cms_logros
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_logros" on public.cms_logros;
create policy "Anon eliminar cms_logros" on public.cms_logros
  for delete to anon using (true);

-- Seed LOGROS
insert into public.cms_logros (orden, icon_key, title, body, image, section_title, activo)
select * from (values
  (1, 'helmet', 'Salvamos los recursos de la reconstrucción y reactivamos las obras que Manabí esperaba', 'Tras un proceso firme de fiscalización, rescatamos los recursos de la reconstrucción y reactivamos un Comité que encontramos en abandono: sin gerente, sin informes y sin control. Gracias a este trabajo, volvieron a avanzar obras como: Puente Quimís, Puente Lodana, Mercado de Calceta, plantas desaladoras para Manta, plaza memorial San Gregorio y el sistema de agua potable para Chone. Protegimos los fondos y aseguramos que la reconstrucción avance donde más se necesita.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/RECONSTRUCCION-MANABI.webp ', 'Obras para Manabí', true),
  (2, 'helmet', 'El puente Lodana en el cantón Santa Ana será una realidad', 'Tras ocho años de abandono, 47.639 habitantes del cantón Santa Ana se movilizarán con seguridad hacia Portoviejo y Honorato Vásquez, en Manabí, con el nuevo puente Lodana. La obra cuenta con una infraestructura segura y moderna que mejora la movilidad, reduce tiempos de traslado y promueve el desarrollo económico y social del lugar.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/lodana-.webp ', NULL, true),
  (3, 'helmet', 'El puente Quimís, de Jipijapa, una promesa cumplida', 'En Jipijapa ejecuta la construcción del Puente Quimís, una obra estratégica que fortalece la conectividad vial en el sur de Manabí, mejora la seguridad para miles de usuarios y dinamiza la economía local al facilitar el traslado de personas, productos agrícolas y comercio entre comunidades históricamente postergadas.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/PUENTE-QUIMIS-.webp ', NULL, true),
  (4, 'helmet', 'Plaza San Gregorio: memoria, justicia y reactivación para Portoviejo', 'Luego del terremoto de 2016 y tras años de espera, el centro de Portoviejo empieza a saldar una deuda histórica con la construcción de la Plaza Memorial San Gregorio, una obra impulsada por el Gobierno del presidente Daniel Noboa que honra la memoria de las víctimas, repara un espacio emblemático de la ciudad y se convierte en un motor de reactivación urbana, cultural y económica para la capital manabita.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/IMG_4816.webp', NULL, true),
  (5, 'helmet', 'Planta de agua potable beneficiará a Sucre, San Vicente y Tosagua', 'Tras décadas de escasez y soluciones inconclusas, el Gobierno anunció la construcción de una planta de agua potable que abastecerá a Sucre, San Vicente y sectores de Tosagua, una obra que garantizará el acceso permanente a agua de calidad y mejorar las condiciones de vida de la población.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/planta-de-agua-san-vicente-.webp', NULL, true),
  (6, 'helmet', 'Nuevo Mercado de Calceta reactiva el comercio y la economía local', 'Tras el colapso del antiguo mercado a causa del terremoto de 2016, Calceta empieza a recuperar un espacio clave para su vida económica con la construcción del nuevo mercado municipal, una obra impulsada por el Gobierno del presidente Daniel Noboa que ofrece condiciones dignas y seguras para comerciantes y consumidores, ordena la actividad comercial y dinamiza la economía del cantón Bolívar, generando empleo y oportunidades.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/mercado-de-calceta.webp', NULL, true),
  (7, 'helmet', 'Chone empieza a saldar una deuda histórica con el acceso al agua potable', 'Garantizar agua segura para Chone es una prioridad, y por ello el Gobierno Nacional ejecuta un sistema integral de agua potable que fortalecerá la infraestructura hídrica del cantón, permitirá un servicio continuo y mejorará la salud y calidad de vida de miles de familias.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/hidrosanitario-Chone-.webp', NULL, true),
  (8, 'ship', 'Los recursos del Puerto de Manta se quedan en Manta', 'Impulsamos una reforma para que el canon del Puerto de Manta deje de ir al Presupuesto General del Estado y se quede directamente en el Municipio y la Prefectura. Esto garantiza que USD 1.859.830 se inviertan en obras e infraestructura para los mantenses.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/PUERTO-DE-MANTA-2.webp ', ' ', true),
  (9, 'helmet', 'Jipijapa tendrá un nuevo y moderno mercado ', 'La construcción del nuevo mercado municipal marca un antes y un después para Jipijapa, al modernizar su actividad comercial y devolver condiciones dignas a comerciantes y consumidores. Esta obra priorizada por el presidente Daniel Noboa reemplaza a una infraestructura levantada en 1960, que había cumplido su ciclo de vida, con áreas agrietadas y puestos que no operaban desde hace más de 20 años, marcando el fin de décadas de deterioro y desorden comercial.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/mercado-jipijapa-.webp', NULL, true),
  (10, 'water', 'Portoviejo y Montecristi ya tienen luz verde para proyectos de agua potable', 'Tras articulación con el MEF, los municipios y la CAF, destrabamos dos avales históricos: USD 50 millones para Portoviejo y USD 28 millones para Montecristi. Con estos dos avales, damos luz verde a obras históricas que por fin podrán ejecutarse para garantizar agua segura y digna a miles de familias.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/megahidro.webp ', ' ', true),
  (11, 'fire', 'Más GLP para los taxistas y una nueva estación en Portoviejo', 'Impulsamos la ampliación del cupo de GLP para todo el país, una decisión que permitió que ciudades como Portoviejo abrieran nuevas estaciones de servicio, como la que entró en funcionamiento en noviembre de 2025. Este incremento en el cupo garantiza mayor disponibilidad del gas licuado de petróleo y un ahorro diario de alrededor de 20 dólares para miles de familias de taxistas. ', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/IMG_1797.webp', ' ', true),
  (12, 'heart', 'Tres nuevos centros de salud para la ruralidad', 'Hicimos seguimiento permanente a los procesos de contratación de los nuevos subcentros del Seguro Social Campesino, que estaban detenidos en la Procuraduría del IESS, y logramos que finalmente avancen para llevar salud a la ruralidad. Hoy, el centro de salud de Danzarín ya está concluido, mientras que los de Higuerón y Playa Prieta registran un avance del 90%. ', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/IMG_3124.webp ', ' ', true),
  (13, 'heart', 'Portoviejo recuperó su Palacio Municipal tras años de espera ', 'El nuevo Palacio Municipal de Portoviejo fue entregado tras años de paralización, gracias al desembolso pendiente gestionado por el Gobierno Nacional y la fiscalización de la asambleísta Valentina Centeno.
La fase 1 tuvo una inversión total de USD 5,7 millones y la fase 2, con aproximadamente USD 3 millones, permitió completar acabados, equipamiento y la puesta en funcionamiento total del edificio.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/492031362_1203425621793046_1733541367569224205_n.webp', NULL, true)
) as t(orden, icon_key, title, body, image, section_title, activo)
where not exists (select 1 from public.cms_logros);

-- ============================================
-- TABLA cms_agenda_internacional
-- ============================================
create table if not exists public.cms_agenda_internacional (
  id uuid primary key default gen_random_uuid(),
  title text,
  tag text,
  subtitle text,
  description text,
  bullets text,
  quote text,
  image text,
  updated_at timestamptz not null default now()
);

alter table public.cms_agenda_internacional enable row level security;

drop policy if exists "Anon leer cms_agenda_internacional" on public.cms_agenda_internacional;
create policy "Anon leer cms_agenda_internacional" on public.cms_agenda_internacional
  for select to anon using (true);

drop policy if exists "Anon insertar cms_agenda_internacional" on public.cms_agenda_internacional;
create policy "Anon insertar cms_agenda_internacional" on public.cms_agenda_internacional
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_agenda_internacional" on public.cms_agenda_internacional;
create policy "Anon actualizar cms_agenda_internacional" on public.cms_agenda_internacional
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_agenda_internacional" on public.cms_agenda_internacional;
create policy "Anon eliminar cms_agenda_internacional" on public.cms_agenda_internacional
  for delete to anon using (true);

-- Seed AGENDAINTER
insert into public.cms_agenda_internacional (title, tag, subtitle, description, bullets, quote, image)
select 'REPRESENTANTE EN LAS NACIONES UNIDAS', 'Presidenta de Comisión', 'Comisión Permanente de Asuntos de las Naciones Unidas (UIP)', 'Los parlamentos del mundo que se concentran en la Unión Interparlamentaria (UIP), me eligieron Presidenta de la Comisión Permanente de Asuntos de las Naciones Unidas, un espacio estratégico donde la diplomacia parlamentaria conecta la voz ciudadana con las decisiones globales y fortalece la relación entre los parlamentos y el sistema de Naciones Unidas. Esta es la primera vez que una ecuatoriana -y una manabita-, ocupa la Presidencia en el máximo organismo de los parlamentos del mundo. ', 'Conduzco una agenda de alto nivel, promoviendo el diálogo entre parlamentos y la coordinación con la Organización de las Naciones Unidas para asegurar compromisos y resultados concretos.; Fortalezco la voz de Ecuador en la agenda global, impulsando debates sobre desarrollo sostenible, derechos humanos, igualdad y cooperación con impacto real para el país.; Conecto lo global con lo nacional, llevando prioridades del Ecuador al diálogo internacional y trayendo de vuelta herramientas que fortalezcan el trabajo legislativo.', 'Con este liderazgo, llevo a  Ecuador a los espacios donde se toman ldecisiones que impactan al mundo y al futuro de nuestra gente.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/439201ff-96ed-4aff-ae63-1abe3daea857.webp '
where not exists (select 1 from public.cms_agenda_internacional);

-- ============================================
-- TABLA cms_biografia
-- ============================================
create table if not exists public.cms_biografia (
  id uuid primary key default gen_random_uuid(),
  orden int not null default 0,
  seccion text not null,
  identificador text,
  titulo text,
  descripcion text,
  imagen text,
  extra text,
  updated_at timestamptz not null default now()
);

alter table public.cms_biografia enable row level security;

drop policy if exists "Anon leer cms_biografia" on public.cms_biografia;
create policy "Anon leer cms_biografia" on public.cms_biografia
  for select to anon using (true);

drop policy if exists "Anon insertar cms_biografia" on public.cms_biografia;
create policy "Anon insertar cms_biografia" on public.cms_biografia
  for insert to anon with check (true);

drop policy if exists "Anon actualizar cms_biografia" on public.cms_biografia;
create policy "Anon actualizar cms_biografia" on public.cms_biografia
  for update to anon using (true) with check (true);

drop policy if exists "Anon eliminar cms_biografia" on public.cms_biografia;
create policy "Anon eliminar cms_biografia" on public.cms_biografia
  for delete to anon using (true);

-- Seed BIOGRAFIA
insert into public.cms_biografia (orden, seccion, identificador, titulo, descripcion, imagen, extra)
select * from (values
  (1, 'HERO', 'TAG', 'Biografía', NULL, NULL, NULL),
  (2, 'HERO', 'MAIN', 'Hola, Soy Valentina Centeno', 'Soy asambleísta del Ecuador y, ante todo, una mujer que sueña con un país más justo. Creo profundamente en el poder de la educación, en las niñas, niños y jóvenes, y en la fuerza de las mujeres para transformar realidades.', 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-07-10-at-15.14.34.webp', NULL),
  (3, 'HERO', 'QUOTE', 'Estoy aquí para luchar por quienes han sido olvidados, para acompañar a los más vulnerables y servir a mi país con profundo compromiso y pasión. ', NULL, NULL, NULL),
  (4, 'HERO', 'CTA', 'Escríbeme al Buzón', NULL, NULL, NULL),
  (5, 'HERO', 'SECONDARY', NULL, NULL, 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/WhatsApp-Image-2025-01-12-at-3.56.55-PM.webp', NULL),
  (6, 'TIMELINE', 'Orígenes', 'Raíces y formación', 'Nací en Portoviejo, Manabí, donde aprendí a trabajar con humildad y propósito. Fui abanderada, deportista de élite en vóley y becaria en la Universidad San Francisco de Quito, donde me gradué Summa Cum Laude en Derecho.', NULL, 'mappin'),
  (7, 'TIMELINE', 'Deporte', 'Servicio Social', 'Mi vocación social nació temprano y se fortaleció durante la pandemia, cuando impulsé una red de apoyo humanitario.', NULL, 'award'),
  (8, 'TIMELINE', 'Formación', 'En la política', 'Mi camino en el servicio público inició como Subsecretaria del Deporte', NULL, 'book'),
  (9, 'TIMELINE', 'Actualidad', 'Asambleísta Nacional', 'Luego, a los 27 años, llegué a la Asamblea Nacional, donde asumí la jefatura de la bancada del Movimiento Acción Democrática Nacional y la presidencia de la Comisión de Desarrollo Económico, Productivo y de la Microempresa. Desde ahí he trabajado en leyes urgentes para dar estabilidad al país, combatir el crimen organizado y ampliar oportunidades para miles de familias.', NULL, 'target'),
  (10, 'GALLERY', NULL, NULL, NULL, 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/8.webp', NULL),
  (11, 'GALLERY', NULL, NULL, NULL, 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/9DA30AB6-2EBB-4B8C-BE5B-66D48A8F025E.webp', NULL),
  (12, 'GALLERY', NULL, NULL, NULL, 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/468298479_18465592396050409_5828706857315631082_n.webp', NULL),
  (13, 'GALLERY', NULL, NULL, NULL, 'https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2026/01/54373641189_1c79814b49_o.webp', NULL),
  (14, 'PILLARS', NULL, 'Liderazgo Joven', 'Renovamos la política con ideas nuevas, decisiones firmes y resultados. ', NULL, 'star'),
  (15, 'PILLARS', NULL, 'Empoderamiento femenino', 'Más derechos, más libertad, oportunidades y más mujeres liderando. ', NULL, 'users'),
  (16, 'PILLARS', NULL, 'Justicia firme', 'Defender a la gente y enfrentar con firmeza la inseguridad y la corrupción. ', NULL, 'target'),
  (17, 'FINAL', 'TITLE', 'Pilares de mi gestión', NULL, NULL, NULL),
  (18, 'FINAL', 'BTN', 'Únete al Cambio', NULL, NULL, NULL)
) as t(orden, seccion, identificador, titulo, descripcion, imagen, extra)
where not exists (select 1 from public.cms_biografia);

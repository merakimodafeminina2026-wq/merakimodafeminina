import fs from 'fs'
import path from 'path'

const schemaHeader = `-- ====================================================================
-- MERAKI FEMME - ESQUEMA DE BANCO DE DADOS COMPLETO PARA SUPABASE (SQL)
-- Execute este arquivo no SQL Editor do Supabase para configurar 100%
-- das tabelas, políticas de segurança (RLS), buckets e dados em produção.
-- ====================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA SETUP SEGURO E LIMPO
SET statement_timeout = 0;
SET client_encoding = 'UTF8';

-- 2. CRIAR EXTENSÃO UUID SE NÃO EXISTIR
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABELA: profiles (Perfis de Usuários/Clientes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    cpf TEXT,
    address TEXT,
    cep TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    tipo_user TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir todas as colunas se a tabela já existir
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_user TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ====================================================================
-- TABELA: products (Produtos)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(10, 2) DEFAULT 0.00,
    image TEXT[] DEFAULT '{}',
    badge TEXT DEFAULT '',
    section TEXT DEFAULT 'featured',
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    description TEXT DEFAULT '',
    stock INTEGER DEFAULT 10,
    inpromocombo BOOLEAN DEFAULT FALSE,
    iscustomizable BOOLEAN DEFAULT FALSE,
    custompricewith NUMERIC(10, 2) DEFAULT 0.00,
    custompricewithout NUMERIC(10, 2) DEFAULT 0.00,
    customfeeletter NUMERIC(10, 2) DEFAULT 0.00,
    customfeenumber NUMERIC(10, 2) DEFAULT 0.00,
    customfeeemoji NUMERIC(10, 2) DEFAULT 0.00,
    customizable_emojis TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir todas as colunas se a tabela já existir
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS inpromocombo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS iscustomizable BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custompricewith NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custompricewithout NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS customfeeletter NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS customfeenumber NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS customfeeemoji NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS customizable_emojis TEXT[] DEFAULT '{}';

-- ====================================================================
-- TABELA: categories (Categorias da Loja)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    "group" TEXT DEFAULT 'Geral',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "group" TEXT DEFAULT 'Geral';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';

-- ====================================================================
-- TABELA: orders (Pedidos realizados)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customername TEXT,
    customeremail TEXT,
    customerphone TEXT,
    customercpf TEXT,
    shippingaddress JSONB,
    paymentmethod TEXT,
    subtotal NUMERIC(10, 2),
    shipping NUMERIC(10, 2),
    discount NUMERIC(10, 2),
    total NUMERIC(10, 2),
    coupon TEXT,
    status TEXT DEFAULT 'Pendente',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customerphone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customercpf TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shippingaddress JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paymentmethod TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping NUMERIC(10, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon TEXT;

-- ====================================================================
-- TABELA: coupons (Cupons de Desconto)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    type TEXT DEFAULT 'percent',
    minpurchase NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABELA: banners (Banners do Carrossel)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image TEXT NOT NULL,
    mobile_image TEXT DEFAULT '',
    alt TEXT DEFAULT '',
    link TEXT DEFAULT '/shop',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS mobile_image TEXT DEFAULT '';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS link TEXT DEFAULT '/shop';

-- ====================================================================
-- TABELA: returns (Trocas e Devoluções)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orderid TEXT,
    itemid TEXT,
    customeremail TEXT,
    type TEXT,
    postagecode TEXT,
    status TEXT DEFAULT 'Pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TABELA: store_config (Configurações Gerais da Loja)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.store_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    whatsapp TEXT,
    sac_phone TEXT,
    address TEXT,
    cnpj TEXT,
    infinitepay_handle TEXT,
    topbarmessages JSONB DEFAULT '[]'::jsonb,
    topbarstyle JSONB DEFAULT '{}'::jsonb,
    promocombo JSONB DEFAULT '{}'::jsonb,
    editorial JSONB DEFAULT '{}'::jsonb,
    available_colors JSONB DEFAULT '[]'::jsonb,
    available_emojis JSONB DEFAULT '[]'::jsonb,
    shipping_message TEXT,
    available_badges JSONB DEFAULT '[]'::jsonb,
    installment_text TEXT,
    banner_transition TEXT DEFAULT 'shatter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- CONFIGURAÇÃO DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública para o E-commerce
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read banners" ON public.banners;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read coupons" ON public.coupons;
CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read store_config" ON public.store_config;
CREATE POLICY "Public read store_config" ON public.store_config FOR SELECT USING (true);

-- Permissão total para inserção/atualização (Suporta operações anon e autenticadas do app)
DROP POLICY IF EXISTS "Allow public write products" ON public.products;
CREATE POLICY "Allow public write products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;
CREATE POLICY "Allow public write categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write banners" ON public.banners;
CREATE POLICY "Allow public write banners" ON public.banners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write coupons" ON public.coupons;
CREATE POLICY "Allow public write coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write orders" ON public.orders;
CREATE POLICY "Allow public write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write returns" ON public.returns;
CREATE POLICY "Allow public write returns" ON public.returns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write store_config" ON public.store_config;
CREATE POLICY "Allow public write store_config" ON public.store_config FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public write profiles" ON public.profiles;
CREATE POLICY "Allow public write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- CONFIGURAÇÃO DO BUCKET DE STORAGE (IMAGENS DOS PRODUTOS & BANNERS)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas do Storage para Leitura e Upload Público
DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public storage insert" ON storage.objects;
CREATE POLICY "Public storage insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
CREATE POLICY "Public storage update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;
CREATE POLICY "Public storage delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- ====================================================================
-- DADOS INICIAIS (SEED) - CONFIGURAÇÃO, CATEGORIAS E CUPOM DE BOAS-VINDAS
-- ====================================================================
INSERT INTO public.store_config (
    id, whatsapp, sac_phone, address, cnpj, infinitepay_handle,
    topbarmessages, topbarstyle, promocombo, editorial, shipping_message, banner_transition
) VALUES (
    'default',
    '551123880403',
    '(11) 2388-0403',
    'Avenida Alfredo Nasser, Qd. 14, Lt. 05 - Centro, Bonfinópolis - GO, CEP: 75225-000',
    '57.484.768/0064-89',
    'merakimodafeminina2026',
    '["✨ Frete Grátis acima de R$ 299 • Parcele em até 12x", "Utilize o cupom BEMVIND010 em sua primeira compra!", "Ganhe 5% de desconto pagando no PIX!"]'::jsonb,
    '{"bgColor": "#C6A76A", "textColor": "#FFFFFF"}'::jsonb,
    '{"title": "Combo Sutiã", "subtitle": "Do P ao EG. Diversos modelos para você escolher.", "image": "/assets/categories/cat-conjuntos.jpg", "price2Items": 139, "price3Items": 169, "link": "/category/promo-combo", "query": "sutiã", "visible": true}'::jsonb,
    '{"label": "Artesanal & Premium", "title": "A arte de se sentir extraordinária.", "description": "Cada costura, cada detalhe em renda foi pensado para elevar sua confiança e celebrar sua beleza única em todos os momentos.", "buttonText": "Ver Manifesto", "buttonLink": "/story", "image": "/assets/banners/banner-2.jpg"}'::jsonb,
    'Frete grátis para a região Centro-Oeste nas compras acima de R$ 299,90.',
    'shatter'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons (code, value, type, minpurchase)
VALUES 
    ('BEMVINDA10', 10.00, 'percent', 0.00),
    ('BEMVIND010', 10.00, 'percent', 0.00)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.categories (name, "group", description, image)
VALUES
    ('Conjuntos', 'Geral', 'Conjuntos de lingerie finas e exclusivas', '/assets/categories/cat-conjuntos.jpg'),
    ('Linha Sexy', 'Geral', 'Peças sensuais com renda e transparência', '/assets/categories/cat-sexy.jpg'),
    ('Noite', 'Geral', 'Camisolas, babydolls e robes para suas noites', '/assets/categories/cat-noite.jpg'),
    ('Plus Size', 'Geral', 'Modelagem especial com conforto e elegância', '/assets/categories/cat-plus.jpg'),
    ('Acessórios', 'Geral', 'Cintas-liga, gargantilhas e complementos', '/assets/categories/cat-acessorios.jpg')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.banners (image, mobile_image, alt, link)
VALUES
    ('/assets/banners/banner-1.jpg', '', 'Nova Coleção Meraki - Transforme-se', '/shop'),
    ('/assets/banners/banner-2.jpg', '', 'Estilo e Elegância - Meraki Store', '/shop'),
    ('/assets/banners/banner-3.jpg', '', 'Sua melhor versão com Meraki', '/shop')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- IMPORTAÇÃO DE PRODUTOS DA MERAKI STORE
-- ====================================================================
`

const productsContent = fs.readFileSync('products_clean.sql', 'utf8')

// Merge header and products
fs.writeFileSync('supabase_schema.sql', schemaHeader + '\n' + productsContent, 'utf8')
console.log('✅ supabase_schema.sql gerado com sucesso!')

-- ====================================================================
-- SCRIPT DE SEGURANÇA E BLINDAGEM RLS (ROW LEVEL SECURITY) - SUPABASE
-- Copie e cole este script no SQL Editor do seu painel Supabase
-- ====================================================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Criar função de segurança para verificar se o usuário logado é Admin no Banco
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND tipo_user = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. REMOVER TODAS AS POLÍTICAS PERMISSIVAS ANTIGAS DE ESCRITA PÚBLICA
DROP POLICY IF EXISTS "Allow public write products" ON public.products;
DROP POLICY IF EXISTS "Allow public write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public write banners" ON public.banners;
DROP POLICY IF EXISTS "Allow public write coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public write orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public write returns" ON public.returns;
DROP POLICY IF EXISTS "Allow public write store_config" ON public.store_config;
DROP POLICY IF EXISTS "Allow public write profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public write reviews" ON public.reviews;

-- 4. POLÍTICAS DE LEITURA PÚBLICA (Qualquer visitante pode ver produtos e banners)
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

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

-- 5. POLÍTICAS DA TABELA PROFILES (Segurança do Usuário)
-- Visitante normal só lê seu próprio perfil. Apenas Admin lê e gerencia todos os perfis.
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy" ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
    (auth.uid() = id AND tipo_user = (SELECT tipo_user FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
);

-- 6. POLÍTICAS DE PRODUTOS, CATEGORIAS, BANNERS, CUPONS E CONFIGURAÇÕES
-- Leitura pública livre | Modificação e Deleção RESTRITA ESTRITAMENTE A ADMINISTRADORES
DROP POLICY IF EXISTS "Admin write products" ON public.products;
CREATE POLICY "Admin write products" ON public.products FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write categories" ON public.categories;
CREATE POLICY "Admin write categories" ON public.categories FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write banners" ON public.banners;
CREATE POLICY "Admin write banners" ON public.banners FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write coupons" ON public.coupons;
CREATE POLICY "Admin write coupons" ON public.coupons FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write store_config" ON public.store_config;
CREATE POLICY "Admin write store_config" ON public.store_config FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. POLÍTICAS DE PEDIDOS E TROCAS (ORDERS & RETURNS)
-- Visitantes podem criar pedidos no checkout | Apenas o próprio cliente ou o Admin lê o pedido | Apenas Admin atualiza/deleta
DROP POLICY IF EXISTS "Orders insert policy" ON public.orders;
CREATE POLICY "Orders insert policy" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
CREATE POLICY "Orders select policy" ON public.orders FOR SELECT
USING (
    customer_email = auth.jwt() ->> 'email' 
    OR user_id = auth.uid() 
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Orders admin update delete" ON public.orders;
CREATE POLICY "Orders admin update delete" ON public.orders FOR UPDATE USING (public.is_admin());

-- 8. RESTRIÇÃO DO BUCKET DE IMAGENS (STORAGE)
DROP POLICY IF EXISTS "Public storage insert" ON storage.objects;
DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;

CREATE POLICY "Admin storage write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated' OR public.is_admin()));
CREATE POLICY "Admin storage update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admin storage delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin());

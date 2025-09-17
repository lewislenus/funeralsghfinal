-- Create brochures table for managing funeral brochures
CREATE TABLE IF NOT EXISTS public.brochures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funeral_id uuid NOT NULL REFERENCES public.funerals(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    pdf_url text NOT NULL,
    thumbnail_url text,
    cloudinary_public_id text,
    file_size bigint,
    upload_type varchar(50) DEFAULT 'cloudinary',
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brochures_funeral_id ON public.brochures(funeral_id);
CREATE INDEX IF NOT EXISTS idx_brochures_is_active ON public.brochures(is_active);
CREATE INDEX IF NOT EXISTS idx_brochures_display_order ON public.brochures(display_order);

-- Enable RLS
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brochures

-- Public can view active brochures for approved funerals
CREATE POLICY "public_view_active_brochures" ON public.brochures
    FOR SELECT TO anon, authenticated
    USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM public.funerals f 
            WHERE f.id = brochures.funeral_id 
            AND f.status = 'approved'
        )
    );

-- Users can view their own brochures
CREATE POLICY "users_view_own_brochures" ON public.brochures
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.funerals f 
            WHERE f.id = brochures.funeral_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can insert brochures for their own funerals
CREATE POLICY "users_insert_own_brochures" ON public.brochures
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.funerals f 
            WHERE f.id = brochures.funeral_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can update their own brochures
CREATE POLICY "users_update_own_brochures" ON public.brochures
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.funerals f 
            WHERE f.id = brochures.funeral_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can delete their own brochures
CREATE POLICY "users_delete_own_brochures" ON public.brochures
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.funerals f 
            WHERE f.id = brochures.funeral_id 
            AND f.user_id = auth.uid()
        )
    );

-- Admin policies (admin email: funeralsghana@gmail.com)
CREATE POLICY "admin_manage_all_brochures" ON public.brochures
    FOR ALL TO authenticated
    USING (auth.email() = 'funeralsghana@gmail.com')
    WITH CHECK (auth.email() = 'funeralsghana@gmail.com');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brochures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_brochures_updated_at
    BEFORE UPDATE ON public.brochures
    FOR EACH ROW
    EXECUTE FUNCTION update_brochures_updated_at();
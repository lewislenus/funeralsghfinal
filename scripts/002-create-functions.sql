-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_funerals
    BEFORE UPDATE ON public.funerals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment funeral views
CREATE OR REPLACE FUNCTION public.increment_funeral_views(funeral_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.funerals 
    SET views_count = views_count + 1 
    WHERE id = funeral_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get funeral statistics
CREATE OR REPLACE FUNCTION public.get_funeral_stats(funeral_uuid UUID)
RETURNS TABLE(
    condolences_count BIGINT,
    donations_total DECIMAL,
    donations_count BIGINT,
    views_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.condolences WHERE funeral_id = funeral_uuid AND is_approved = true),
        (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE funeral_id = funeral_uuid AND status = 'completed'),
        (SELECT COUNT(*) FROM public.donations WHERE funeral_id = funeral_uuid AND status = 'completed'),
        (SELECT f.views_count FROM public.funerals f WHERE f.id = funeral_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
    total_users BIGINT,
    total_funerals BIGINT,
    pending_funerals BIGINT,
    flagged_content BIGINT,
    total_donations DECIMAL,
    monthly_growth DECIMAL
) AS $$
DECLARE
    current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
    last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    current_month_users BIGINT;
    last_month_users BIGINT;
BEGIN
    -- Get current month users
    SELECT COUNT(*) INTO current_month_users
    FROM public.profiles 
    WHERE created_at >= current_month_start;
    
    -- Get last month users
    SELECT COUNT(*) INTO last_month_users
    FROM public.profiles 
    WHERE created_at >= last_month_start AND created_at < current_month_start;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.profiles),
        (SELECT COUNT(*) FROM public.funerals),
        (SELECT COUNT(*) FROM public.funerals WHERE status = 'pending'),
        (SELECT COUNT(*) FROM public.condolences WHERE is_approved = false),
        (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE status = 'completed'),
        CASE 
            WHEN last_month_users > 0 THEN 
                ROUND(((current_month_users - last_month_users)::DECIMAL / last_month_users * 100), 2)
            ELSE 0 
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

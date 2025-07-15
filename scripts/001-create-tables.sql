-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE funeral_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'completed');
CREATE TYPE user_role AS ENUM ('user', 'organizer', 'admin');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funerals table
CREATE TABLE public.funerals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Deceased information
    deceased_name TEXT NOT NULL,
    deceased_photo_url TEXT,
    date_of_birth DATE NOT NULL,
    date_of_death DATE NOT NULL,
    biography TEXT,
    
    -- Funeral details
    funeral_date DATE NOT NULL,
    funeral_time TIME NOT NULL,
    venue TEXT NOT NULL,
    region TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates JSONB, -- {lat: number, lng: number}
    
    -- Family information
    family_name TEXT NOT NULL,
    family_contact TEXT,
    family_details TEXT,
    
    -- Media
    poster_url TEXT,
    brochure_url TEXT,
    livestream_url TEXT,
    gallery_urls TEXT[], -- Array of image URLs
    
    -- Status and metadata
    status funeral_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Condolences table
CREATE TABLE public.condolences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funeral_id UUID REFERENCES public.funerals(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_location TEXT,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funeral_id UUID REFERENCES public.funerals(id) ON DELETE CASCADE NOT NULL,
    donor_name TEXT,
    donor_email TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    message TEXT,
    payment_method TEXT, -- 'momo', 'card', etc.
    payment_reference TEXT,
    status donation_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin actions log
CREATE TABLE public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'approve_funeral', 'reject_funeral', 'moderate_content', etc.
    target_type TEXT NOT NULL, -- 'funeral', 'condolence', 'user', etc.
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_funerals_organizer ON public.funerals(organizer_id);
CREATE INDEX idx_funerals_status ON public.funerals(status);
CREATE INDEX idx_funerals_region ON public.funerals(region);
CREATE INDEX idx_funerals_date ON public.funerals(funeral_date);
CREATE INDEX idx_funerals_created ON public.funerals(created_at);
CREATE INDEX idx_condolences_funeral ON public.condolences(funeral_id);
CREATE INDEX idx_condolences_approved ON public.condolences(is_approved);
CREATE INDEX idx_donations_funeral ON public.donations(funeral_id);
CREATE INDEX idx_donations_status ON public.donations(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funerals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condolences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Funerals policies
CREATE POLICY "Anyone can view approved funerals" ON public.funerals
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Organizers can view own funerals" ON public.funerals
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create funerals" ON public.funerals
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own funerals" ON public.funerals
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can view all funerals" ON public.funerals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all funerals" ON public.funerals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Condolences policies
CREATE POLICY "Anyone can view approved condolences" ON public.condolences
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can create condolences" ON public.condolences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Funeral organizers can view all condolences for their funerals" ON public.condolences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.funerals 
            WHERE id = funeral_id AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all condolences" ON public.condolences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update condolences" ON public.condolences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Donations policies
CREATE POLICY "Anyone can create donations" ON public.donations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Funeral organizers can view donations for their funerals" ON public.donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.funerals 
            WHERE id = funeral_id AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all donations" ON public.donations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin actions policies
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert sample profiles (these would normally be created through auth)
INSERT INTO public.profiles (id, email, full_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@funeralsghana.com', 'Admin User', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'organizer1@example.com', 'John Asante', 'organizer'),
('550e8400-e29b-41d4-a716-446655440003', 'organizer2@example.com', 'Mary Mensah', 'organizer');

-- Insert sample funerals
INSERT INTO public.funerals (
    id, organizer_id, deceased_name, deceased_photo_url, date_of_birth, date_of_death,
    biography, funeral_date, funeral_time, venue, region, location,
    family_name, family_contact, poster_url, livestream_url, status
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'Kwame Asante',
    '/placeholder.svg?height=200&width=200',
    '1945-03-15',
    '2024-01-10',
    'A beloved teacher and community leader who dedicated his life to education in Kumasi. Known for his wisdom, kindness, and unwavering commitment to his students and community.',
    '2024-01-20',
    '09:00',
    'St. Peter''s Cathedral',
    'Ashanti',
    'Kumasi, Ghana',
    'Asante Family',
    '+233 24 123 4567',
    '/placeholder.svg?height=400&width=300',
    'https://youtube.com/watch?v=example',
    'approved'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    'Akosua Mensah',
    '/placeholder.svg?height=200&width=200',
    '1960-07-22',
    '2024-01-08',
    'A successful businesswoman and mother who touched many lives in Accra. She was known for her generosity and community spirit.',
    '2024-01-18',
    '10:00',
    'Holy Trinity Cathedral',
    'Greater Accra',
    'Accra, Ghana',
    'Mensah Family',
    '+233 24 234 5678',
    '/placeholder.svg?height=400&width=300',
    'https://facebook.com/watch?v=example',
    'approved'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Kofi Boateng',
    '/placeholder.svg?height=200&width=200',
    '1938-11-05',
    '2024-01-05',
    'A respected elder and traditional leader from the Northern Region. He was instrumental in preserving local customs and traditions.',
    '2024-01-15',
    '08:00',
    'Tamale Central Mosque',
    'Northern',
    'Tamale, Ghana',
    'Boateng Family',
    '+233 24 345 6789',
    '/placeholder.svg?height=400&width=300',
    NULL,
    'approved'
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'Ama Osei',
    '/placeholder.svg?height=200&width=200',
    '1952-09-12',
    '2024-01-12',
    'A dedicated nurse who served the Western Region for over 30 years. She was beloved by patients and colleagues alike.',
    '2024-01-22',
    '11:00',
    'Methodist Church',
    'Western',
    'Takoradi, Ghana',
    'Osei Family',
    '+233 24 456 7890',
    '/placeholder.svg?height=400&width=300',
    'https://youtube.com/watch?v=example2',
    'approved'
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'Yaw Adjei',
    '/placeholder.svg?height=200&width=200',
    '1943-06-30',
    '2024-01-01',
    'A prominent farmer and agricultural innovator from the Eastern Region. He helped modernize farming techniques in his community.',
    '2024-01-12',
    '09:30',
    'Presbyterian Church',
    'Eastern',
    'Koforidua, Ghana',
    'Adjei Family',
    '+233 24 567 8901',
    '/placeholder.svg?height=400&width=300',
    NULL,
    'approved'
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    'Efua Darko',
    '/placeholder.svg?height=200&width=200',
    '1955-04-18',
    '2024-01-14',
    'A talented seamstress and fashion designer who empowered women through her craft. She trained hundreds of young women in tailoring.',
    '2024-01-25',
    '10:30',
    'Catholic Church',
    'Central',
    'Cape Coast, Ghana',
    'Darko Family',
    '+233 24 678 9012',
    '/placeholder.svg?height=400&width=300',
    'https://facebook.com/watch?v=example2',
    'approved'
);

-- Insert sample condolences
INSERT INTO public.condolences (funeral_id, author_name, author_email, author_location, message, is_approved) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Akosua Mensah', 'akosua@example.com', 'Accra', 'Mr. Asante was my teacher in primary school. He inspired me to become a teacher myself. His dedication to education and his students was unmatched. Rest in peace, sir.', true),
('660e8400-e29b-41d4-a716-446655440001', 'Kofi Boateng', 'kofi@example.com', 'Kumasi', 'A great man who touched many lives. My condolences to the family. Mr. Asante taught my children and they still speak of his kindness.', true),
('660e8400-e29b-41d4-a716-446655440001', 'Ama Osei', 'ama@example.com', 'Kumasi', 'Thank you for everything you did for our community. Your legacy will live on through all the lives you touched.', true),
('660e8400-e29b-41d4-a716-446655440002', 'John Doe', 'john@example.com', 'Accra', 'Akosua was a wonderful woman who helped many people in our community. She will be greatly missed.', true),
('660e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 'jane@example.com', 'Tema', 'My heartfelt condolences to the Mensah family. Akosua was an inspiration to all who knew her.', true);

-- Insert sample donations
INSERT INTO public.donations (funeral_id, donor_name, donor_email, amount, message, payment_method, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Anonymous', NULL, 200.00, 'In memory of a great teacher', 'momo', 'completed'),
('660e8400-e29b-41d4-a716-446655440001', 'Former Students', 'students@example.com', 500.00, 'Thank you for everything, Mr. Asante', 'card', 'completed'),
('660e8400-e29b-41d4-a716-446655440001', 'Kumasi Teachers Union', 'union@example.com', 1000.00, 'Honoring a dedicated educator', 'card', 'completed'),
('660e8400-e29b-41d4-a716-446655440002', 'Business Associates', 'business@example.com', 800.00, 'In loving memory of Akosua', 'momo', 'completed'),
('660e8400-e29b-41d4-a716-446655440002', 'Community Members', 'community@example.com', 600.00, 'She helped so many of us', 'card', 'completed');

-- Update views count for funerals
UPDATE public.funerals SET views_count = 245 WHERE id = '660e8400-e29b-41d4-a716-446655440001';
UPDATE public.funerals SET views_count = 189 WHERE id = '660e8400-e29b-41d4-a716-446655440002';
UPDATE public.funerals SET views_count = 156 WHERE id = '660e8400-e29b-41d4-a716-446655440003';
UPDATE public.funerals SET views_count = 298 WHERE id = '660e8400-e29b-41d4-a716-446655440004';
UPDATE public.funerals SET views_count = 203 WHERE id = '660e8400-e29b-41d4-a716-446655440005';
UPDATE public.funerals SET views_count = 367 WHERE id = '660e8400-e29b-41d4-a716-446655440006';


-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profiles' AND (storage.filename(name) LIKE 'avatars/' || auth.uid() || '-%'));

-- Allow users to update and delete their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profiles' AND (storage.filename(name) LIKE 'avatars/' || auth.uid() || '-%'));

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profiles' AND (storage.filename(name) LIKE 'avatars/' || auth.uid() || '-%'));

-- Allow public read access to all profile images
CREATE POLICY "Public read access to profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateUserProfile, validateUsername } = useUserProfile();
  
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: ''
  });
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || ''
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear username error when typing
    if (name === 'username') {
      setUsernameError('');
      
      // Validate username format as the user types
      if (value) {
        const validation = validateUsername(value.toLowerCase());
        if (!validation.isValid) {
          setUsernameError(validation.message || 'Invalid username format');
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    setAvatarFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl(null);
    setAvatarFile(null);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return avatarUrl;
    
    try {
      // Create a unique file path for the avatar
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;
      
      setUploadProgress(0);
      
      // Upload the file without onUploadProgress since it's not supported
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, {
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Set progress to 100% when done
      setUploadProgress(100);
      
      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return publicURL.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Avatar upload failed",
        description: "Failed to upload profile image.",
        variant: "destructive"
      });
      return avatarUrl;
    }
  };

  const validateForm = async (): Promise<boolean> => {
    // Username is required
    if (!formData.username) {
      setUsernameError('Username is required');
      return false;
    }
    
    // Validate username format
    const validation = validateUsername(formData.username.toLowerCase());
    if (!validation.isValid) {
      setUsernameError(validation.message || 'Invalid username format');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      const isValid = await validateForm();
      if (!isValid) {
        setIsLoading(false);
        return;
      }
      
      // Upload avatar if changed
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar();
      }
      
      // Update profile
      const updates = {
        ...formData,
        avatar_url: finalAvatarUrl
      };
      
      const success = await updateUserProfile(updates);
      
      if (success) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-dishco-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-dishco-text-light">Update your personal information</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-dishco-primary text-white text-xl">
              {(formData.display_name?.[0] || formData.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex space-x-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload size={16} className="mr-1" />
              {avatarUrl ? 'Change' : 'Upload'}
            </Button>
            
            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeleteAvatar}
              >
                <Trash2 size={16} className="mr-1" />
                Remove
              </Button>
            )}
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="display_name" className="block mb-1">Display Name</Label>
            <Input 
              id="display_name" 
              name="display_name" 
              value={formData.display_name} 
              onChange={handleChange} 
              placeholder="Your name"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the name that will be displayed to other users
            </p>
          </div>
          
          <div>
            <Label htmlFor="username" className="block mb-1">Username</Label>
            <Input 
              id="username" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="username"
              className={`w-full ${usernameError ? 'border-red-500' : ''}`}
            />
            {usernameError && (
              <p className="text-red-500 text-xs mt-1">{usernameError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              3-25 characters, lowercase letters, numbers, and underscores only. Cannot start with underscore.
            </p>
          </div>
          
          <div>
            <Label htmlFor="bio" className="block mb-1">Bio</Label>
            <textarea 
              id="bio" 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder="Tell us about yourself"
              className="w-full rounded-md border border-input px-3 py-2 text-sm min-h-[100px]"
              maxLength={160}
            />
            <p className="text-xs text-right text-gray-500 mt-1">
              {formData.bio.length}/160
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              {uploadProgress > 0 ? (
                <>Uploading... {uploadProgress}%</>
              ) : (
                <>Saving...</>
              )}
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
};

export default EditProfilePage;

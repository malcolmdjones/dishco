import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar, Heart, Plus, UserPlus, UserMinus, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { 
    profile: currentUserProfile,
    loading: profileLoading,
    fetchUserProfile,
    isFollowing,
    followUser,
    unfollowUser,
    activities,
    activityLoading,
    fetchUserActivities
  } = useUserProfile();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const { savedRecipeIds, getSavedRecipes } = useRecipes();
  const savedRecipes = getSavedRecipes();

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      try {
        // If username is specified, fetch that profile
        if (username) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') { // Not found
              toast({
                title: "Profile not found",
                description: `No user with username ${username} was found.`,
                variant: "destructive"
              });
              navigate('/');
              return;
            }
            throw error;
          }
          
          setProfile(data as UserProfile);
          
          // Check if the current user is following this user
          if (isAuthenticated && user?.id && data.id !== user.id) {
            const following = await isFollowing(data.id);
            setIsUserFollowing(following);
          }
          
          // Fetch user activities
          fetchUserActivities(data.id);
        } else {
          // If no username, show current user profile
          if (!isAuthenticated) {
            navigate('/auth');
            return;
          }
          
          setProfile(currentUserProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [username, currentUserProfile, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!profile || !user) return;
    
    setFollowLoading(true);
    
    try {
      if (isUserFollowing) {
        const success = await unfollowUser(profile.id);
        if (success) {
          setIsUserFollowing(false);
        }
      } else {
        const success = await followUser(profile.id);
        if (success) {
          setIsUserFollowing(true);
        }
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = user?.id === profile?.id;

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading || profileLoading) {
    return (
      <div className="animate-fade-in p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <Skeleton className="h-8 w-40 ml-2" />
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-7 w-40 mt-3" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        
        <Skeleton className="h-28 w-full mt-4" />
        
        <div className="mt-6">
          <Skeleton className="h-10 w-full" />
          <div className="mt-4 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="animate-fade-in p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold ml-2">Profile</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-dishco-text-light mb-4">Profile not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold ml-2">{isOwnProfile ? 'My Profile' : 'Profile'}</h1>
        </div>
        
        {isOwnProfile && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings size={20} />
          </Button>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="px-4">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-dishco-primary text-white text-xl">
              {(profile?.display_name?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold mt-3">
            {profile.display_name || profile.username || 'User'}
          </h2>
          
          <p className="text-dishco-text-light text-sm mt-1">
            @{profile.username || 'user'}
            {profile.member_since && (
              <> · Joined {formatDate(profile.member_since)}</>
            )}
          </p>
          
          {profile.bio && (
            <p className="text-center mt-3 max-w-md">
              {profile.bio}
            </p>
          )}
          
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="text-center">
              <p className="font-bold">{profile.followers_count || 0}</p>
              <p className="text-sm text-dishco-text-light">Followers</p>
            </div>
            
            <div className="text-center">
              <p className="font-bold">{profile.following_count || 0}</p>
              <p className="text-sm text-dishco-text-light">Following</p>
            </div>
            
            <div className="text-center">
              <p className="font-bold">{profile.rank_number || 0}</p>
              <p className="text-sm text-dishco-text-light">Rank</p>
            </div>
          </div>
          
          {!isOwnProfile && isAuthenticated && (
            <Button 
              className={`mt-4 ${isUserFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : ''}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {isUserFollowing ? (
                <>
                  <UserMinus size={18} className="mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        
        <Separator className="my-6" />
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
            {activityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : activities.length > 0 ? (
              activities.map(activity => (
                <div 
                  key={activity.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {activity.activity_type === 'rate_recipe' && <Star className="text-yellow-500" size={20} />}
                      {activity.activity_type === 'save_recipe' && <Heart className="text-red-500" size={20} />}
                      {activity.activity_type === 'follow' && <UserPlus className="text-blue-500" size={20} />}
                      {activity.activity_type === 'create_plan' && <Calendar className="text-green-500" size={20} />}
                      {activity.activity_type === 'logged_meal' && <Clock className="text-purple-500" size={20} />}
                    </div>
                    
                    <div className="ml-3">
                      <p>{activity.content || getActivityDescription(activity)}</p>
                      <p className="text-xs text-dishco-text-light mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-dishco-text-light">No activity yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recipes" className="space-y-4">
            {/* This would show recipes created by the user - implement later */}
            <div className="text-center py-8">
              <p className="text-dishco-text-light mb-4">No recipes created yet.</p>
              {isOwnProfile && (
                <Link to="/custom-recipes">
                  <Button>
                    <Plus size={16} className="mr-1" />
                    Create Recipe
                  </Button>
                </Link>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-4">
            {isOwnProfile ? (
              savedRecipes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {savedRecipes.slice(0, 6).map(recipe => (
                    <div 
                      key={recipe.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img 
                          src={recipe.imageSrc} 
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm truncate">{recipe.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-dishco-text-light mb-4">No saved recipes yet.</p>
                  <Link to="/recipe-discovery">
                    <Button>
                      <Heart size={16} className="mr-1" />
                      Discover Recipes
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-dishco-text-light">
                  {profile.display_name || profile.username || 'This user'} hasn't saved any recipes yet.
                </p>
              </div>
            )}
            
            {isOwnProfile && savedRecipes.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate('/saved-recipes')}>
                  View All Saved Recipes
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper function to generate activity descriptions
const getActivityDescription = (activity: any) => {
  switch (activity.activity_type) {
    case 'save_recipe':
      return 'Saved a recipe';
    case 'rate_recipe':
      return 'Rated a recipe';
    case 'update_rating':
      return 'Updated a recipe rating';
    case 'follow':
      return 'Started following a user';
    case 'create_plan':
      return 'Created a meal plan';
    case 'logged_meal':
      return 'Logged a meal';
    default:
      return 'Performed an action';
  }
};

export default ProfilePage;

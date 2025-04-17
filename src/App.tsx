
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth, AuthProvider, ProtectedRoute } from '@/hooks/useAuth';
import { ThemeProvider } from './components/theme-provider';

// Page imports
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import PlanningPage from '@/pages/PlanningPage';
import ExploreRecipesPage from '@/pages/ExploreRecipesPage';
import GroceryListPage from '@/pages/GroceryListPage';
import MyShelfPage from '@/pages/MyShelfPage';
import SavedPlansPage from '@/pages/SavedPlansPage';
import SavedRecipesPage from '@/pages/SavedRecipesPage';
import SavedDessertsPage from '@/pages/SavedDessertsPage';
import SavedSnacksPage from '@/pages/SavedSnacksPage';
import NotFound from '@/pages/NotFound';
import NutritionGoalsPage from '@/pages/NutritionGoalsPage';
import DietaryRestrictionsPage from '@/pages/DietaryRestrictionsPage';
import CustomRecipesPage from '@/pages/CustomRecipesPage';
import AddExternalRecipePage from '@/pages/AddExternalRecipePage';
import EditCustomRecipePage from '@/pages/EditCustomRecipePage';
import RecipeDiscoveryPage from '@/pages/RecipeDiscoveryPage';
import MorePage from '@/pages/MorePage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import ChangeEmailPage from '@/pages/ChangeEmailPage';
import PrivacySecurityPage from '@/pages/PrivacySecurityPage';
import NotificationsPage from '@/pages/NotificationsPage';
import AdminPage from '@/pages/AdminPage';
import ExploreDesserts from '@/pages/ExploreDesserts';
import ExploreSnacksPage from '@/pages/ExploreSnacksPage';
import Index from '@/pages/Index';
import LogMealPage from '@/pages/LogMealPage';
import LogMealSearchPage from '@/pages/LogMealSearchPage';
import LogMealCustomFoodPage from '@/pages/LogMealCustomFoodPage';
import LogMealCustomRecipePage from '@/pages/LogMealCustomRecipePage';
import LogMealQuickAddPage from '@/pages/LogMealQuickAddPage';
import LogMealScanPage from '@/pages/LogMealScanPage';
import AdminAddRecipePage from '@/pages/admin/AdminAddRecipePage';
import AdminEditRecipePage from '@/pages/admin/AdminEditRecipePage';
import AdminViewRecipePage from '@/pages/admin/AdminViewRecipePage';
import CreateMealPlanPage from '@/pages/CreateMealPlanPage';
import { ThemeProvider } from './components/theme-provider';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppLayout>
          <Toaster />
          {/* Public Routes */}
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/index" element={<Index />} />
            <Route path="*" element={<NotFound />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/planning" element={<ProtectedRoute><PlanningPage /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExploreRecipesPage /></ProtectedRoute>} />
            <Route path="/grocery" element={<ProtectedRoute><GroceryListPage /></ProtectedRoute>} />
            <Route path="/my-shelf" element={<ProtectedRoute><MyShelfPage /></ProtectedRoute>} />
            <Route path="/saved-plans" element={<ProtectedRoute><SavedPlansPage /></ProtectedRoute>} />
            <Route path="/saved-recipes" element={<ProtectedRoute><SavedRecipesPage /></ProtectedRoute>} />
            <Route path="/saved-desserts" element={<ProtectedRoute><SavedDessertsPage /></ProtectedRoute>} />
            <Route path="/saved-snacks" element={<ProtectedRoute><SavedSnacksPage /></ProtectedRoute>} />
            <Route path="/nutrition-goals" element={<ProtectedRoute><NutritionGoalsPage /></ProtectedRoute>} />
            <Route path="/dietary-restrictions" element={<ProtectedRoute><DietaryRestrictionsPage /></ProtectedRoute>} />
            <Route path="/custom-recipes" element={<ProtectedRoute><CustomRecipesPage /></ProtectedRoute>} />
            <Route path="/add-external-recipe" element={<ProtectedRoute><AddExternalRecipePage /></ProtectedRoute>} />
            <Route path="/edit-custom-recipe/:id" element={<ProtectedRoute><EditCustomRecipePage /></ProtectedRoute>} />
            <Route path="/recipe-discovery" element={<ProtectedRoute><RecipeDiscoveryPage /></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><MorePage /></ProtectedRoute>} />
            <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
            <Route path="/change-email" element={<ProtectedRoute><ChangeEmailPage /></ProtectedRoute>} />
            <Route path="/privacy-security" element={<ProtectedRoute><PrivacySecurityPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/explore-desserts" element={<ProtectedRoute><ExploreDesserts /></ProtectedRoute>} />
            <Route path="/explore-snacks" element={<ProtectedRoute><ExploreSnacksPage /></ProtectedRoute>} />
            <Route path="/log-meal" element={<ProtectedRoute><LogMealPage /></ProtectedRoute>} />
            <Route path="/log-meal/search" element={<ProtectedRoute><LogMealSearchPage /></ProtectedRoute>} />
            <Route path="/log-meal/custom-food" element={<ProtectedRoute><LogMealCustomFoodPage /></ProtectedRoute>} />
            <Route path="/log-meal/custom-recipe" element={<ProtectedRoute><LogMealCustomRecipePage /></ProtectedRoute>} />
            <Route path="/log-meal/quick-add" element={<ProtectedRoute><LogMealQuickAddPage /></ProtectedRoute>} />
            <Route path="/log-meal/scan" element={<ProtectedRoute><LogMealScanPage /></ProtectedRoute>} />
              <Route path="/admin/add-recipe" element={<ProtectedRoute><AdminAddRecipePage /></ProtectedRoute>} />
              <Route path="/admin/edit-recipe/:id" element={<ProtectedRoute><AdminEditRecipePage /></ProtectedRoute>} />
              <Route path="/admin/view-recipe/:id" element={<ProtectedRoute><AdminViewRecipePage /></ProtectedRoute>} />
              <Route path="/create-meal-plan" element={<ProtectedRoute><CreateMealPlanPage /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

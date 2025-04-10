
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppLayout from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import PlanningPage from "./pages/PlanningPage";
import GroceryListPage from "./pages/GroceryListPage";
import MorePage from "./pages/MorePage";
import NotFound from "./pages/NotFound";
import LogMealPage from "./pages/LogMealPage";
import NutritionGoalsPage from "./pages/NutritionGoalsPage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import SavedMealPlansPage from "./pages/SavedMealPlansPage";
import DietaryRestrictionsPage from "./pages/DietaryRestrictionsPage";
import AddExternalRecipePage from "./pages/AddExternalRecipePage";
import CustomRecipesPage from "./pages/CustomRecipesPage";
import EditCustomRecipePage from "./pages/EditCustomRecipePage";
import CreateMealPlanPage from "./pages/CreateMealPlanPage";
import ExploreRecipesPage from "./pages/ExploreRecipesPage";
import ExploreSnacksPage from "./pages/ExploreSnacksPage";
import SavedSnacksPage from "./pages/SavedSnacksPage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangeEmailPage from "./pages/ChangeEmailPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotificationsPage from "./pages/NotificationsPage";
import PrivacySecurityPage from "./pages/PrivacySecurityPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import AdminAddRecipePage from "./pages/admin/AdminAddRecipePage";
import AdminEditRecipePage from "./pages/admin/AdminEditRecipePage";
import AdminViewRecipePage from "./pages/admin/AdminViewRecipePage";
import RecipeDiscoveryPage from "./pages/RecipeDiscoveryPage";
import SnackCategoryPage from "./pages/SnackCategoryPage";

// We'll create a protected route component that requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Admin route requires both authentication and admin status
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// App root component with authentication provider
const App = () => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/planning" element={<ProtectedRoute><AppLayout><PlanningPage /></AppLayout></ProtectedRoute>} />
            <Route path="/create-meal-plan" element={<ProtectedRoute><AppLayout><CreateMealPlanPage /></AppLayout></ProtectedRoute>} />
            <Route path="/explore-recipes" element={<AppLayout><ExploreRecipesPage /></AppLayout>} />
            <Route path="/explore-snacks" element={<AppLayout><ExploreSnacksPage /></AppLayout>} />
            <Route path="/explore-snacks/:category" element={<AppLayout><SnackCategoryPage /></AppLayout>} />
            <Route path="/recipe-discovery" element={<AppLayout><RecipeDiscoveryPage /></AppLayout>} />
            <Route path="/grocery" element={<ProtectedRoute><AppLayout><GroceryListPage /></AppLayout></ProtectedRoute>} />
            <Route path="/more" element={<AppLayout><MorePage /></AppLayout>} />
            <Route path="/log-meal" element={<ProtectedRoute><AppLayout><LogMealPage /></AppLayout></ProtectedRoute>} />
            <Route path="/saved-plans" element={<ProtectedRoute><AppLayout><SavedMealPlansPage /></AppLayout></ProtectedRoute>} />
            <Route path="/saved-recipes" element={<ProtectedRoute><AppLayout><SavedRecipesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/saved-snacks" element={<ProtectedRoute><AppLayout><SavedSnacksPage /></AppLayout></ProtectedRoute>} />
            <Route path="/custom-recipes" element={<ProtectedRoute><AppLayout><CustomRecipesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/add-recipe" element={<ProtectedRoute><AppLayout><AddExternalRecipePage /></AppLayout></ProtectedRoute>} />
            <Route path="/edit-recipe/:recipeId" element={<ProtectedRoute><AppLayout><EditCustomRecipePage /></AppLayout></ProtectedRoute>} />
            <Route path="/nutrition-goals" element={<ProtectedRoute><AppLayout><NutritionGoalsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><AccountSettingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><AppLayout><EditProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="/change-email" element={<ProtectedRoute><AppLayout><ChangeEmailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><AppLayout><ChangePasswordPage /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><AppLayout><PrivacySecurityPage /></AppLayout></ProtectedRoute>} />
            <Route path="/dietary-restrictions" element={<ProtectedRoute><AppLayout><DietaryRestrictionsPage /></AppLayout></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/admin/add-recipe" element={<AdminRoute><AdminAddRecipePage /></AdminRoute>} />
            <Route path="/admin/edit-recipe/:recipeId" element={<AdminRoute><AdminEditRecipePage /></AdminRoute>} />
            <Route path="/admin/recipe/:recipeId" element={<AdminRoute><AdminViewRecipePage /></AdminRoute>} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

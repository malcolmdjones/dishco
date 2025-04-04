
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
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
import SavedPlansPage from "./pages/SavedPlansPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/planning" element={<AppLayout><PlanningPage /></AppLayout>} />
            <Route path="/create-meal-plan" element={<AppLayout><CreateMealPlanPage /></AppLayout>} />
            <Route path="/explore-recipes" element={<AppLayout><ExploreRecipesPage /></AppLayout>} />
            <Route path="/explore-snacks" element={<AppLayout><ExploreSnacksPage /></AppLayout>} />
            <Route path="/grocery" element={<AppLayout><GroceryListPage /></AppLayout>} />
            <Route path="/more" element={<AppLayout><MorePage /></AppLayout>} />
            <Route path="/log-meal" element={<AppLayout><LogMealPage /></AppLayout>} />
            <Route path="/saved-plans" element={<AppLayout><SavedPlansPage /></AppLayout>} />
            <Route path="/saved-recipes" element={<AppLayout><SavedRecipesPage /></AppLayout>} />
            <Route path="/saved-snacks" element={<AppLayout><SavedSnacksPage /></AppLayout>} />
            <Route path="/custom-recipes" element={<AppLayout><CustomRecipesPage /></AppLayout>} />
            <Route path="/add-recipe" element={<AppLayout><AddExternalRecipePage /></AppLayout>} />
            <Route path="/edit-recipe/:recipeId" element={<AppLayout><EditCustomRecipePage /></AppLayout>} />
            <Route path="/nutrition-goals" element={<AppLayout><NutritionGoalsPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><AccountSettingsPage /></AppLayout>} />
            <Route path="/edit-profile" element={<AppLayout><EditProfilePage /></AppLayout>} />
            <Route path="/change-email" element={<AppLayout><ChangeEmailPage /></AppLayout>} />
            <Route path="/change-password" element={<AppLayout><ChangePasswordPage /></AppLayout>} />
            <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
            <Route path="/privacy" element={<AppLayout><PrivacySecurityPage /></AppLayout>} />
            <Route path="/dietary-restrictions" element={<AppLayout><DietaryRestrictionsPage /></AppLayout>} />
            <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

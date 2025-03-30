import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CreateMealPlanPage from "./pages/CreateMealPlanPage";
import ExploreRecipesPage from "./pages/ExploreRecipesPage";
import AuthPage from "./pages/AuthPage";
import RecipeManagementPage from './pages/RecipeManagementPage';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
            <Route path="/planning" element={<ProtectedRoute><AppLayout><PlanningPage /></AppLayout></ProtectedRoute>} />
            <Route path="/create-meal-plan" element={<ProtectedRoute><AppLayout><CreateMealPlanPage /></AppLayout></ProtectedRoute>} />
            <Route path="/explore-recipes" element={<ProtectedRoute><AppLayout><ExploreRecipesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/grocery" element={<ProtectedRoute><AppLayout><GroceryListPage /></AppLayout></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><AppLayout><MorePage /></AppLayout></ProtectedRoute>} />
            <Route path="/log-meal" element={<ProtectedRoute><AppLayout><LogMealPage /></AppLayout></ProtectedRoute>} />
            <Route path="/saved-plans" element={<ProtectedRoute><AppLayout><SavedPlansPage /></AppLayout></ProtectedRoute>} />
            <Route path="/saved-recipes" element={<ProtectedRoute><AppLayout><SavedRecipesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/add-recipe" element={<ProtectedRoute><AppLayout><AddExternalRecipePage /></AppLayout></ProtectedRoute>} />
            <Route path="/nutrition-goals" element={<ProtectedRoute><AppLayout><NutritionGoalsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><AccountSettingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/dietary-restrictions" element={<ProtectedRoute><AppLayout><DietaryRestrictionsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/recipe-management" element={
              <ProtectedRoute>
                <RecipeManagementPage />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

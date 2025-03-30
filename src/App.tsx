
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/planning" element={<AppLayout><PlanningPage /></AppLayout>} />
          <Route path="/grocery" element={<AppLayout><GroceryListPage /></AppLayout>} />
          <Route path="/more" element={<AppLayout><MorePage /></AppLayout>} />
          <Route path="/log-meal" element={<AppLayout><LogMealPage /></AppLayout>} />
          <Route path="/saved-plans" element={<AppLayout><SavedPlansPage /></AppLayout>} />
          <Route path="/saved-recipes" element={<AppLayout><SavedRecipesPage /></AppLayout>} />
          <Route path="/add-recipe" element={<AppLayout><AddExternalRecipePage /></AppLayout>} />
          <Route path="/nutrition-goals" element={<AppLayout><NutritionGoalsPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><AccountSettingsPage /></AppLayout>} />
          <Route path="/dietary-restrictions" element={<AppLayout><DietaryRestrictionsPage /></AppLayout>} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

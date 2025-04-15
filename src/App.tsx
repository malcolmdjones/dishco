
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import HomePage from './pages/HomePage';
import ExploreRecipesPage from './pages/ExploreRecipesPage';
import CustomRecipesPage from './pages/CustomRecipesPage';
import LogMealPage from './pages/LogMealPage';
import PlanningPage from './pages/PlanningPage';
import MorePage from './pages/MorePage';
import RecipeDiscoveryPage from './pages/RecipeDiscoveryPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import SavedSnacksPage from './pages/SavedSnacksPage';
import SavedDessertsPage from './pages/SavedDessertsPage';
import SavedPlansPage from './pages/SavedPlansPage';
import ExploreSnacksPage from './pages/ExploreSnacksPage';
import ExploreDesserts from './pages/ExploreDesserts';
import EditCustomRecipePage from './pages/EditCustomRecipePage';
import CreateMealPlanPage from './pages/CreateMealPlanPage';
import AddExternalRecipePage from './pages/AddExternalRecipePage';
import AuthPage from './pages/AuthPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ChangeEmailPage from './pages/ChangeEmailPage';
import EditProfilePage from './pages/EditProfilePage';
import PrivacySecurityPage from './pages/PrivacySecurityPage';
import NotificationsPage from './pages/NotificationsPage';
import DietaryRestrictionsPage from './pages/DietaryRestrictionsPage';
import NutritionGoalsPage from './pages/NutritionGoalsPage';
import GroceryListPage from './pages/GroceryListPage';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import AdminPage from './pages/AdminPage';
import AdminAddRecipePage from './pages/admin/AdminAddRecipePage';
import AdminEditRecipePage from './pages/admin/AdminEditRecipePage';
import AdminViewRecipePage from './pages/admin/AdminViewRecipePage';

// New food logging system pages
import FoodLogPage from './pages/FoodLogPage';
import QuickAddPage from './pages/QuickAddPage';
import CustomFoodPage from './pages/CustomFoodPage';
import CustomRecipePage from './pages/CustomRecipePage';
import ScanNutritionPage from './pages/ScanNutritionPage';

// For use with framer-motion page transitions
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExploreRecipesPage />} />
          <Route path="/explore/snacks" element={<ExploreSnacksPage />} />
          <Route path="/explore/desserts" element={<ExploreDesserts />} />
          
          {/* Food Logging System */}
          <Route path="/log-food" element={<FoodLogPage />} />
          <Route path="/log-meal" element={<LogMealPage />} />
          <Route path="/quick-add" element={<QuickAddPage />} />
          <Route path="/custom-food" element={<CustomFoodPage />} />
          <Route path="/custom-recipe" element={<CustomRecipePage />} />
          <Route path="/scan-barcode" element={<LogMealPage />} /> {/* Reusing LogMealPage with barcode scanner */}
          <Route path="/scan-nutrition" element={<ScanNutritionPage />} />
          
          {/* Planning Routes */}
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/saved/plans" element={<SavedPlansPage />} />
          <Route path="/saved/recipes" element={<SavedRecipesPage />} />
          <Route path="/saved/snacks" element={<SavedSnacksPage />} />
          <Route path="/saved/desserts" element={<SavedDessertsPage />} />
          <Route path="/custom-recipes" element={<CustomRecipesPage />} />
          <Route path="/create-meal-plan" element={<CreateMealPlanPage />} />
          <Route path="/grocery-list" element={<GroceryListPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/recipe-discovery" element={<RecipeDiscoveryPage />} />
          <Route path="/edit-custom-recipe/:id" element={<EditCustomRecipePage />} />
          <Route path="/add-external-recipe" element={<AddExternalRecipePage />} />
          
          {/* Auth and Settings */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
          <Route path="/settings/change-password" element={<ChangePasswordPage />} />
          <Route path="/settings/change-email" element={<ChangeEmailPage />} />
          <Route path="/settings/edit-profile" element={<EditProfilePage />} />
          <Route path="/settings/privacy-security" element={<PrivacySecurityPage />} />
          <Route path="/settings/notifications" element={<NotificationsPage />} />
          <Route path="/settings/dietary-restrictions" element={<DietaryRestrictionsPage />} />
          <Route path="/settings/nutrition-goals" element={<NutritionGoalsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/add-recipe" element={<AdminAddRecipePage />} />
          <Route path="/admin/edit-recipe/:id" element={<AdminEditRecipePage />} />
          <Route path="/admin/view-recipe/:id" element={<AdminViewRecipePage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Router>
  );
}

export default App;

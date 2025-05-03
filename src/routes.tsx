
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LogMealPage from './pages/LogMealPage';
import LogMealSearchPage from './pages/LogMealSearchPage';
import LogMealScanPage from './pages/LogMealScanPage';
import LogMealQuickAddPage from './pages/LogMealQuickAddPage';
import LogMealCustomFoodPage from './pages/LogMealCustomFoodPage';
import LogMealCustomRecipePage from './pages/LogMealCustomRecipePage';
import MorePage from './pages/MorePage';
import PlanningPage from './pages/PlanningPage';
import ProgressPage from './pages/ProgressPage';
import CreateMealPlanPage from './pages/CreateMealPlanPage';
import SavedPlansPage from './pages/SavedPlansPage';
import ExploreRecipesPage from './pages/ExploreRecipesPage';
import ExploreDesserts from './pages/ExploreDesserts';
import ExploreSnacksPage from './pages/ExploreSnacksPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import SavedSnacksPage from './pages/SavedSnacksPage';
import SavedDessertsPage from './pages/SavedDessertsPage';
import NutritionGoalsPage from './pages/NutritionGoalsPage';
import GroceryListPage from './pages/GroceryListPage';
import NotificationsPage from './pages/NotificationsPage';
import PrivacySecurityPage from './pages/PrivacySecurityPage';
import RecipeTinderPage from './pages/RecipeTinderPage';
import FunCategoriesPage from './pages/FunCategoriesPage';
import NotFound from './pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
      <Route path="/log-meal" element={<AppLayout><LogMealPage /></AppLayout>} />
      <Route path="/log-meal/search" element={<AppLayout><LogMealSearchPage /></AppLayout>} />
      <Route path="/log-meal/scan" element={<AppLayout><LogMealScanPage /></AppLayout>} />
      <Route path="/log-meal/quick-add" element={<AppLayout><LogMealQuickAddPage /></AppLayout>} />
      <Route path="/log-meal/custom-food" element={<AppLayout><LogMealCustomFoodPage /></AppLayout>} />
      <Route path="/log-meal/custom-recipe" element={<AppLayout><LogMealCustomRecipePage /></AppLayout>} />
      <Route path="/planning" element={<AppLayout><PlanningPage /></AppLayout>} />
      <Route path="/progress" element={<AppLayout><ProgressPage /></AppLayout>} />
      <Route path="/more" element={<AppLayout><MorePage /></AppLayout>} />
      <Route path="/create-meal-plan" element={<AppLayout><CreateMealPlanPage /></AppLayout>} />
      <Route path="/saved-plans" element={<AppLayout><SavedPlansPage /></AppLayout>} />
      <Route path="/explore-recipes" element={<AppLayout><ExploreRecipesPage /></AppLayout>} />
      <Route path="/explore-desserts" element={<AppLayout><ExploreDesserts /></AppLayout>} />
      <Route path="/explore-snacks" element={<AppLayout><ExploreSnacksPage /></AppLayout>} />
      <Route path="/fun-categories" element={<AppLayout><FunCategoriesPage /></AppLayout>} />
      <Route path="/saved-recipes" element={<AppLayout><SavedRecipesPage /></AppLayout>} />
      <Route path="/saved-snacks" element={<AppLayout><SavedSnacksPage /></AppLayout>} />
      <Route path="/saved-desserts" element={<AppLayout><SavedDessertsPage /></AppLayout>} />
      <Route path="/nutrition-goals" element={<AppLayout><NutritionGoalsPage /></AppLayout>} />
      <Route path="/grocery-list" element={<AppLayout><GroceryListPage /></AppLayout>} />
      <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
      <Route path="/privacy-security" element={<AppLayout><PrivacySecurityPage /></AppLayout>} />
      <Route path="/recipe-tinder" element={<AppLayout><RecipeTinderPage /></AppLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

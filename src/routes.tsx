
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
import NotFound from './pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/log-meal" element={<LogMealPage />} />
        <Route path="/log-meal/search" element={<LogMealSearchPage />} />
        <Route path="/log-meal/scan" element={<LogMealScanPage />} />
        <Route path="/log-meal/quick-add" element={<LogMealQuickAddPage />} />
        <Route path="/log-meal/custom-food" element={<LogMealCustomFoodPage />} />
        <Route path="/log-meal/custom-recipe" element={<LogMealCustomRecipePage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/create-meal-plan" element={<CreateMealPlanPage />} />
        <Route path="/saved-plans" element={<SavedPlansPage />} />
        <Route path="/explore-recipes" element={<ExploreRecipesPage />} />
        <Route path="/explore-desserts" element={<ExploreDesserts />} />
        <Route path="/explore-snacks" element={<ExploreSnacksPage />} />
        <Route path="/saved-recipes" element={<SavedRecipesPage />} />
        <Route path="/saved-snacks" element={<SavedSnacksPage />} />
        <Route path="/saved-desserts" element={<SavedDessertsPage />} />
        <Route path="/nutrition-goals" element={<NutritionGoalsPage />} />
        <Route path="/grocery-list" element={<GroceryListPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/privacy-security" element={<PrivacySecurityPage />} />
        <Route path="/recipe-tinder" element={<RecipeTinderPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

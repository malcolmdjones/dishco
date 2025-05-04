
import {
  createBrowserRouter,
} from "react-router-dom";
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import MorePage from '@/pages/MorePage';
import NotFound from '@/pages/NotFoundPage';
import AuthPage from '@/pages/AuthPage';
import SettingsPage from '@/pages/SettingsPage';
import EditProfilePage from '@/pages/EditProfilePage';
import ExploreRecipesPage from '@/pages/ExploreRecipesPage';
import RecipeDetailPage from '@/pages/RecipeDetailPage';
import SavedRecipesPage from '@/pages/SavedRecipesPage';
import SavedSnacksPage from '@/pages/SavedSnacksPage';
import SavedDessertsPage from '@/pages/SavedDessertsPage';
import CustomRecipesPage from '@/pages/CustomRecipesPage';
import RecipeTinderPage from '@/pages/RecipeTinderPage';
import NutritionGoalsPage from "./pages/NutritionGoalsPage";
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: '/more',
        element: <MorePage />
      },
      {
        path: '/auth',
        element: <AuthPage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      },
      {
        path: '/settings/edit-profile',
        element: <EditProfilePage />
      },
      {
        path: '/edit-profile',
        element: <EditProfilePage />
      },
      {
        path: '/explore-recipes',
        element: <ExploreRecipesPage />
      },
      {
        path: '/recipe/:id',
        element: <RecipeDetailPage />
      },
      {
        path: '/saved-recipes',
        element: <SavedRecipesPage />
      },
      {
        path: '/saved-snacks',
        element: <SavedSnacksPage />
      },
      {
        path: '/saved-desserts',
        element: <SavedDessertsPage />
      },
      {
        path: '/custom-recipes',
        element: <CustomRecipesPage />
      },
      {
        path: '/recipe-tinder',
        element: <RecipeTinderPage />
      },
      {
        path: '/nutrition-goals',
        element: <NutritionGoalsPage />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
      {
        path: '/profile/:username',
        element: <ProfilePage />
      },
    ],
  },
]);

export default routes;

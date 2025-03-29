
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
          {/* Placeholder routes for More page sub-pages */}
          <Route path="/saved-recipes" element={<AppLayout><ComingSoonPage title="Saved Recipes" /></AppLayout>} />
          <Route path="/add-recipe" element={<AppLayout><ComingSoonPage title="Add External Recipe" /></AppLayout>} />
          <Route path="/nutrition-goals" element={<AppLayout><ComingSoonPage title="Nutrition Goals" /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><ComingSoonPage title="Account Settings" /></AppLayout>} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Simple placeholder for routes not yet implemented
const ComingSoonPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-dishco-text-light mb-8">Coming soon in a future update!</p>
    <div className="w-24 h-24 rounded-full bg-dishco-primary bg-opacity-10 flex items-center justify-center animate-pulse-light">
      <span className="text-4xl">🚧</span>
    </div>
  </div>
);

export default App;

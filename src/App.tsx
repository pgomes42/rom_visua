import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import ApartmentDetail from "./pages/ApartmentDetail";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import ManageBooking from "./pages/ManageBooking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/apartamento/:id" element={<ApartmentDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/gerenciar-reserva" element={<ManageBooking />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

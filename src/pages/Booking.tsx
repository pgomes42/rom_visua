import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="font-body text-xs font-semibold tracking-[0.4em] uppercase text-primary mb-4">
              Reservar
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold italic text-foreground">
              Faça a Sua <span className="text-gradient-gold">Reserva</span>
            </h1>
          </motion.div>
          <BookingForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;

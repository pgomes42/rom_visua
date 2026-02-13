import { motion } from "framer-motion";
import { apartmentService } from "@/lib/apartmentService";
import ApartmentCard from "./ApartmentCard";

const ApartmentGrid = () => {
  const apartments = apartmentService.getApartments();
  const activeApartments = apartments.filter((a) => a.status === "ativo");

  return (
    <section id="apartments" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs font-semibold tracking-[0.4em] uppercase text-primary mb-4">
            Alojamento
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold italic text-foreground mb-4">
            Os Nossos <span className="text-gradient-gold">Apartamentos</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Cada espaço foi cuidadosamente desenhado para proporcionar uma experiência única e memorável.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeApartments.map((apartment, index) => (
            <ApartmentCard key={apartment.id} apartment={apartment} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApartmentGrid;

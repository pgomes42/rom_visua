import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, BedDouble, Maximize } from "lucide-react";
import { Apartment, formatCurrency } from "@/data/apartments";

interface ApartmentCardProps {
  apartment: Apartment;
  index: number;
}

const ApartmentCard = ({ apartment, index }: ApartmentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/apartamento/${apartment.id}`} className="block">
        <div className="relative overflow-hidden rounded-sm aspect-[4/3] mb-5">
          <img
            src={apartment.fotos[0]}
            alt={apartment.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors duration-500" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-background/80 backdrop-blur-sm text-primary font-body text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-sm">
              {apartment.tipologia}
            </span>
          </div>
        </div>

        <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {apartment.nome}
        </h3>

        <div className="flex items-center gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-body">
            <Users className="w-3.5 h-3.5" /> {apartment.capacidade} hóspedes
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-body">
            <BedDouble className="w-3.5 h-3.5" /> {apartment.suites} suite{apartment.suites > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-body">
            <Maximize className="w-3.5 h-3.5" /> {apartment.dimensao}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-display text-lg font-bold text-primary">
            {formatCurrency(apartment.preco_noite)}
          </span>
          <span className="font-body text-xs text-muted-foreground">/ noite</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ApartmentCard;

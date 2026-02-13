import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-room.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Roomview Boutique Suite"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="font-body text-xs sm:text-sm font-semibold tracking-[0.4em] uppercase text-primary mb-6">
            Patriota, Luanda — Angola
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold italic mb-6 leading-tight"
        >
          <span className="text-gradient-gold">Experiência</span>
          <br />
          <span className="text-foreground">Boutique Premium</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-light"
        >
          Alojamento exclusivo com o máximo conforto, privacidade e segurança 24/7.
          Uma estadia que redefine o conceito de luxo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/reservar"
            className="bg-gradient-gold text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase px-10 py-4 rounded-sm hover:shadow-gold-lg transition-all duration-300"
          >
            Reservar Agora
          </Link>
          <a
            href="#apartments"
            className="border border-primary/30 text-primary font-body text-sm font-semibold tracking-wider uppercase px-10 py-4 rounded-sm hover:bg-primary/10 transition-all duration-300"
          >
            Ver Apartamentos
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#features" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <span className="font-body text-xs tracking-widest uppercase">Descobrir</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;

import { Shield, Sparkles, Lock, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: "Luxo & Conforto",
    description: "Acabamentos premium e design sofisticado em cada detalhe do seu alojamento.",
  },
  {
    icon: Lock,
    title: "Privacidade Total",
    description: "Espaços pensados para garantir a máxima privacidade durante a sua estadia.",
  },
  {
    icon: Shield,
    title: "Segurança 24/7",
    description: "Sistema de segurança completo com vigilância permanente para sua tranquilidade.",
  },
  {
    icon: Clock,
    title: "Reserva Instantânea",
    description: "Reserve online em minutos com confirmação imediata e pagamento seguro.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs font-semibold tracking-[0.4em] uppercase text-primary mb-4">
            Porquê escolher-nos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold italic text-foreground">
            A Experiência <span className="text-gradient-gold">Roomview</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

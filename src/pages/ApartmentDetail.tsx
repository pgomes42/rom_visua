import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, BedDouble, Bath, Maximize, MapPin, Shield, Sparkles, Images } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency, BOOKING_DEPOSIT } from "@/data/apartments";
import { apartmentService } from "@/lib/apartmentService";
import { PhotoGalleryModal } from "@/components/PhotoGallery";
import { useState } from "react";

const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apartments = apartmentService.getApartments();
  const apartment = apartments.find((a) => a.id === id);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (!apartment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-foreground mb-4">Apartamento não encontrado</h1>
          <Link to="/" className="text-primary font-body hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero image */}
        <div className="relative h-[50vh] min-h-[400px] group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
          <img src={apartment.fotos[0]} alt={apartment.nome} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          {/* Gallery Button Overlay */}
          {apartment.fotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-sm backdrop-blur-sm transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
            >
              <Images className="w-4 h-4" />
              <span className="text-sm font-medium">Ver Galeria ({apartment.fotos.length} fotos)</span>
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-body text-sm mb-4 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl md:text-5xl font-bold italic text-foreground"
              >
                {apartment.nome}
              </motion.h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-body text-lg text-muted-foreground leading-relaxed"
              >
                {apartment.descricao}
              </motion.p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Hóspedes", value: `Até ${apartment.capacidade}` },
                  { icon: BedDouble, label: "Suites", value: apartment.suites.toString() },
                  { icon: Bath, label: "WC", value: apartment.banheiros.toString() },
                  { icon: Maximize, label: "Área", value: apartment.dimensao },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-sm p-4 text-center">
                    <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="font-body text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-display text-lg font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-foreground">Comodidades</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Wi-Fi Premium", "Ar Condicionado", "TV Smart", "Cofre Digital", "Mini Bar", "Segurança 24/7", "Roupa de Cama Premium", "Amenidades de Luxo"].map((item) => (
                    <div key={item} className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 bg-card border border-border rounded-sm p-4">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{apartment.localizacao}</p>
                  <p className="font-body text-xs text-muted-foreground">Localização central com acesso facilitado</p>
                </div>
              </div>
            </div>

            {/* Booking sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card border border-border rounded-sm p-6 space-y-6">
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatCurrency(apartment.preco_noite)}
                    </span>
                    <span className="font-body text-sm text-muted-foreground">/ noite</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    Sinal obrigatório: {formatCurrency(BOOKING_DEPOSIT)}
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    Pequeno-almoço não incluído. Sem reembolso.
                  </p>
                </div>

                <Link
                  to={`/reservar?apartment=${apartment.id}`}
                  className="block w-full bg-gradient-gold text-primary-foreground font-body text-sm font-semibold tracking-wider uppercase px-6 py-4 rounded-sm text-center hover:shadow-gold-lg transition-all duration-300"
                >
                  Reservar Agora
                </Link>

                <a
                  href={`https://wa.me/244923000000?text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre o ${apartment.nome}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-primary/30 text-primary font-body text-sm font-semibold tracking-wider uppercase px-6 py-4 rounded-sm text-center hover:bg-primary/10 transition-all duration-300"
                >
                  Contactar via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Photo Gallery Modal */}
      {isGalleryOpen && (
        <PhotoGalleryModal
          photos={apartment.fotos}
          apartmentName={apartment.nome}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ApartmentDetail;

import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { HOTEL_INFO } from "@/data/apartments";

const logoSrc = `${import.meta.env.BASE_URL}tranferencia/Logo-page.png`;

const Footer = () => {
  return (
    <footer id="contact" className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <img src={logoSrc} alt="Roomview Boutique" className="h-[4rem] mb-6 rotate-0 object-contain" />
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Alojamento boutique premium no Patriota, Luanda. 
              Conforto, privacidade e segurança 24/7.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">Links Rápidos</h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">Início</Link>
              <Link to="/reservar" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">Reservar</Link>
              <Link to="/admin" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">Administração</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-6">Contacto</h4>
            <div className="flex flex-col gap-4">
              <a href={HOTEL_INFO.googlemaps_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                {HOTEL_INFO.endereco}
              </a>
              <a href="tel:+244923000000" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                +244 923 000 000
              </a>
              <a href="mailto:info@roomviewboutique.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                info@roomviewboutique.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Roomview Boutique. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

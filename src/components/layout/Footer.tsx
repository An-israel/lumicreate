import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import logoIcon from "@/assets/logo-icon.png";
import logoLight from "@/assets/logo-light.png";
import brandPattern from "@/assets/brand-pattern.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  
  // Use light logo for dark mode, dark logo for light mode
  const currentLogo = theme === "dark" ? logoIcon : logoLight;

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "Packages", href: "/packages" },
      { name: "Basic Tier", href: "/packages?tier=basic" },
      { name: "Premium Tier", href: "/packages?tier=premium" },
      { name: "Diamond Tier", href: "/packages?tier=diamond" },
    ],
    support: [
      { name: "FAQs", href: "/#faq" },
      { name: "Track Order", href: "/track-order" },
      { name: "Consultations", href: "/consultations" },
      { name: "Contact Us", href: "/about#contact" },
    ],
    company: [
      { name: "About Luminate", href: "/about" },
      { name: "Resources", href: "/resources" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/luminatecreators" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/luminatecreators" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@luminatecreators" },
    { name: "Email", icon: Mail, href: "mailto:hello@luminatecreators.com" },
  ];

  return (
    <footer className="border-t border-border bg-muted/30 relative overflow-hidden">
      {/* Brand Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url(${brandPattern})`,
          backgroundSize: '150px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="container py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={currentLogo} alt="Luminate Creators" className="h-9 w-9" />
              <span className="font-display font-bold text-lg">Luminate Creators</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Empowering Nigerian content creators with curated equipment packages and expert guidance.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Luminate Creators. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for Nigerian creators
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

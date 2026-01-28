import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { usePageContent } from "@/hooks/usePageContent";
import logoIcon from "@/assets/logo-icon.png";
import logoLight from "@/assets/logo-light.png";

const defaultFooterLinks = {
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

const defaultSocialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/luminatecreators" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/luminatecreators" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@luminatecreators" },
  { name: "Email", icon: Mail, href: "mailto:hello@luminatecreators.com" },
];

const socialIconMap: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  email: Mail,
  mail: Mail,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const { content } = usePageContent("global", "footer");
  
  // Use light logo for dark mode, dark logo for light mode
  const currentLogo = theme === "dark" ? logoIcon : logoLight;

  // Use CMS content or defaults
  const tagline = content?.tagline || "Empowering Nigerian content creators with curated equipment packages and expert guidance.";
  const copyrightText = content?.copyright_text || "Made with ❤️ for Nigerian creators";
  
  const shopLinks = content?.shop_links?.length > 0 ? content.shop_links : defaultFooterLinks.shop;
  const supportLinks = content?.support_links?.length > 0 ? content.support_links : defaultFooterLinks.support;
  const companyLinks = content?.company_links?.length > 0 ? content.company_links : defaultFooterLinks.company;
  
  // Process social links from CMS or use defaults
  const socialLinks = content?.social_links?.length > 0 
    ? content.social_links.map((link: { name: string; href: string }) => ({
        ...link,
        icon: socialIconMap[link.name.toLowerCase()] || Mail,
      }))
    : defaultSocialLinks;

  return (
    <footer className="border-t border-border bg-muted/30 relative overflow-hidden">
      <div className="container py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={currentLogo} alt="Luminate Creators" className="h-9 w-9" />
              <span className="font-display font-bold text-lg">Luminate Creators</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {tagline}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social: any) => (
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
              {shopLinks.map((link: { name: string; href: string }) => (
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
              {supportLinks.map((link: { name: string; href: string }) => (
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
              {companyLinks.map((link: { name: string; href: string }) => (
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
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

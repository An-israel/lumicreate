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
    { name: "Basic Tier", href: "/packages/basic" },
    { name: "Premium Tier", href: "/packages/premium" },
    { name: "Diamond Tier", href: "/packages/diamond" },
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

  const columns = [
    { title: "Shop", links: shopLinks },
    { title: "Support", links: supportLinks },
    { title: "Company", links: companyLinks },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={currentLogo} alt="Luminate Creators" className="h-7 w-7" />
              <span className="text-[15px] font-semibold tracking-tight">Luminate Creators</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {tagline}
            </p>
            <div className="mt-6 flex gap-1">
              {socialLinks.map((social: any) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-medium text-foreground mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link: { name: string; href: string }) => (
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
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {currentYear} Luminate Creators. All rights reserved.</p>
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

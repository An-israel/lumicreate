import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import logoIcon from "@/assets/logo-icon.png";

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
  const { content } = usePageContent("global", "footer");
  
  // Use light logo for dark mode, dark logo for light mode
  // The footer is always dark, so always use the light-on-dark logo
  const currentLogo = logoIcon;

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
    <footer className="surface-ink">
      <div className="container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <img src={currentLogo} alt="Luminate Creators" className="h-9 w-9" />
              <span className="font-serif-display text-2xl">Luminate Creators</span>
            </Link>
            <p className="font-serif-display text-3xl leading-tight max-w-sm">
              Your content, <em className="text-brand">elevated.</em>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted max-w-xs">
              {tagline}
            </p>
            <div className="mt-8 flex gap-2">
              {socialLinks.map((social: any) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-border text-ink-muted transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
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
                <h3 className="eyebrow mb-5 text-ink-muted">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link: { name: string; href: string }) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-ink-foreground/80 hover:text-brand transition-colors"
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
        <div className="mt-16 pt-6 border-t border-ink-border flex flex-col md:flex-row justify-between gap-2 text-xs text-ink-muted">
          <p>© {currentYear} Luminate Creators. All rights reserved.</p>
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

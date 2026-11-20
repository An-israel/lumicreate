// CMS Configuration - Defines all editable pages and sections

export interface CMSField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "link" | "array" | "richtext";
  placeholder?: string;
  arrayFields?: CMSField[]; // For array type fields
}

export interface CMSSection {
  label: string;
  description?: string;
  fields: CMSField[];
  removable?: boolean; // Can this section be hidden/removed?
}

export interface CMSPage {
  label: string;
  sections: Record<string, CMSSection>;
}

export const CMS_PAGES: Record<string, CMSPage> = {
  // Global elements (Header & Footer)
  global: {
    label: "Global Elements",
    sections: {
      header: {
        label: "Header / Navigation",
        description: "Site logo, brand name, and navigation links",
        fields: [
          { key: "brand_name", label: "Brand Name", type: "text", placeholder: "Luminate Creators" },
          { key: "announcement", label: "Announcement Bar Text", type: "text", placeholder: "Free 24-hour delivery across Lagos · Nationwide in 2–3 days" },
          { key: "logo_dark", label: "Logo (Dark Mode)", type: "image" },
          { key: "logo_light", label: "Logo (Light Mode)", type: "image" },
          {
            key: "nav_links",
            label: "Navigation Links",
            type: "array",
            arrayFields: [
              { key: "name", label: "Link Text", type: "text" },
              { key: "href", label: "Link URL", type: "link" },
            ],
          },
        ],
      },
      footer: {
        label: "Footer",
        description: "Footer content, links, and social media",
        fields: [
          { key: "tagline", label: "Tagline", type: "textarea", placeholder: "Empowering Nigerian content creators..." },
          { key: "copyright_text", label: "Copyright Text", type: "text", placeholder: "Made with ❤️ for Nigerian creators" },
          {
            key: "social_links",
            label: "Social Media Links",
            type: "array",
            arrayFields: [
              { key: "name", label: "Platform Name", type: "text" },
              { key: "href", label: "URL", type: "link" },
            ],
          },
          {
            key: "shop_links",
            label: "Shop Links",
            type: "array",
            arrayFields: [
              { key: "name", label: "Link Text", type: "text" },
              { key: "href", label: "Link URL", type: "link" },
            ],
          },
          {
            key: "support_links",
            label: "Support Links",
            type: "array",
            arrayFields: [
              { key: "name", label: "Link Text", type: "text" },
              { key: "href", label: "Link URL", type: "link" },
            ],
          },
          {
            key: "company_links",
            label: "Company Links",
            type: "array",
            arrayFields: [
              { key: "name", label: "Link Text", type: "text" },
              { key: "href", label: "Link URL", type: "link" },
            ],
          },
        ],
      },
    },
  },

  // Homepage
  home: {
    label: "Homepage",
    sections: {
      hero: {
        label: "Hero Section",
        description: "Main banner with headline and call-to-action",
        removable: true,
        fields: [
          { key: "badge_text", label: "Badge Text", type: "text", placeholder: "Trusted by 500+ Nigerian creators" },
          { key: "title_line1", label: "Title Line 1", type: "text", placeholder: "Your Content." },
          { key: "title_highlight", label: "Title Highlight", type: "text", placeholder: "Elevated." },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Curated equipment packages designed specifically..." },
          { key: "cta_primary_text", label: "Primary CTA Text", type: "text", placeholder: "Find My Equipment" },
          { key: "cta_primary_link", label: "Primary CTA Link", type: "link", placeholder: "/quiz" },
          { key: "cta_secondary_text", label: "Secondary CTA Text", type: "text", placeholder: "Browse Packages" },
          { key: "cta_secondary_link", label: "Secondary CTA Link", type: "link", placeholder: "/packages" },
          { key: "trust_creators", label: "Creators Count", type: "text", placeholder: "500+ creators" },
          { key: "trust_rating", label: "Rating Text", type: "text", placeholder: "4.9/5 rating" },
          { key: "trust_delivery", label: "Delivery Text", type: "text", placeholder: "24hr Lagos delivery" },
          { key: "showcase_image_1", label: "Hero Image (large)", type: "image" },
          { key: "showcase_image_2", label: "Hero Image (top right)", type: "image" },
          { key: "showcase_image_3", label: "Hero Image (bottom right)", type: "image" },
        ],
      },
      how_it_works: {
        label: "How It Works",
        description: "Step-by-step process explanation",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "How It Works" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea", placeholder: "From discovery to delivery..." },
          {
            key: "steps",
            label: "Steps",
            type: "array",
            arrayFields: [
              { key: "title", label: "Step Title", type: "text" },
              { key: "description", label: "Step Description", type: "textarea" },
            ],
          },
        ],
      },
      package_tiers: {
        label: "Package Tiers",
        description: "Basic, Premium, Diamond package showcase",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Choose Your Package" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
        ],
      },
      resources: {
        label: "Resources Section",
        description: "Blog posts and educational content preview",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Creator Resources" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          { key: "cta_text", label: "CTA Button Text", type: "text", placeholder: "View All Resources" },
          { key: "cta_link", label: "CTA Button Link", type: "link", placeholder: "/resources" },
        ],
      },
      studio_band: {
        label: "Testimonial & Stats Band",
        description: "Dark band with a featured testimonial and key numbers",
        removable: true,
        fields: [
          { key: "quote", label: "Testimonial Quote", type: "textarea" },
          { key: "quote_author", label: "Quote Author", type: "text", placeholder: "Chioma Adeyemi" },
          { key: "quote_role", label: "Author Role", type: "text", placeholder: "YouTube creator · 150K subscribers" },
          {
            key: "stats",
            label: "Stats",
            type: "array",
            arrayFields: [
              { key: "value", label: "Value", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
        ],
      },
      cta_band: {
        label: "Yellow Call-to-Action Band",
        description: "Closing call to action above the footer",
        removable: true,
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Not sure where to start?" },
          { key: "subtitle", label: "Subtitle", type: "textarea" },
          { key: "cta_primary_text", label: "Primary Button Text", type: "text", placeholder: "Take the 2-minute quiz" },
          { key: "cta_primary_link", label: "Primary Button Link", type: "link", placeholder: "/quiz" },
          { key: "cta_secondary_text", label: "Secondary Button Text", type: "text", placeholder: "Talk to an expert" },
          { key: "cta_secondary_link", label: "Secondary Button Link", type: "link", placeholder: "/consultations" },
        ],
      },
      faq: {
        label: "FAQ Section",
        description: "Frequently asked questions",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Frequently Asked Questions" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          {
            key: "questions",
            label: "FAQ Items",
            type: "array",
            arrayFields: [
              { key: "question", label: "Question", type: "text" },
              { key: "answer", label: "Answer", type: "textarea" },
            ],
          },
        ],
      },
    },
  },

  // About Page
  about: {
    label: "About Page",
    sections: {
      hero: {
        label: "Hero Section",
        removable: true,
        fields: [
          { key: "badge_text", label: "Badge Text", type: "text", placeholder: "Our Story" },
          { key: "title", label: "Title", type: "text", placeholder: "Empowering Nigerian" },
          { key: "title_highlight", label: "Title Highlight", type: "text", placeholder: "Creators" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      stats: {
        label: "Stats Section",
        removable: true,
        fields: [
          {
            key: "stats",
            label: "Statistics",
            type: "array",
            arrayFields: [
              { key: "number", label: "Number/Value", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
        ],
      },
      mission: {
        label: "Mission Section",
        removable: true,
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Our Mission" },
          { key: "paragraph1", label: "Paragraph 1", type: "textarea" },
          { key: "paragraph2", label: "Paragraph 2", type: "textarea" },
          {
            key: "bullet_points",
            label: "Bullet Points",
            type: "array",
            arrayFields: [{ key: "text", label: "Point", type: "text" }],
          },
        ],
      },
      values: {
        label: "Values Section",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Our Values" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          {
            key: "values",
            label: "Value Cards",
            type: "array",
            arrayFields: [
              { key: "title", label: "Value Title", type: "text" },
              { key: "description", label: "Value Description", type: "textarea" },
            ],
          },
        ],
      },
      offerings: {
        label: "What We Offer",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "What We Offer" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          {
            key: "offerings",
            label: "Offering Cards",
            type: "array",
            arrayFields: [
              { key: "title", label: "Offering Title", type: "text" },
              { key: "description", label: "Offering Description", type: "textarea" },
            ],
          },
        ],
      },
      testimonials: {
        label: "Testimonials",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "What Creators Say" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          {
            key: "testimonials",
            label: "Testimonials",
            type: "array",
            arrayFields: [
              { key: "quote", label: "Quote", type: "textarea" },
              { key: "name", label: "Name", type: "text" },
              { key: "role", label: "Role/Title", type: "text" },
              { key: "followers", label: "Followers/Stats", type: "text" },
            ],
          },
        ],
      },
      team: {
        label: "Team Section",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Meet the Team" },
          { key: "subtitle", label: "Section Subtitle", type: "textarea" },
          {
            key: "members",
            label: "Team Members",
            type: "array",
            arrayFields: [
              { key: "name", label: "Name", type: "text" },
              { key: "role", label: "Role", type: "text" },
              { key: "bio", label: "Bio", type: "textarea" },
              { key: "image", label: "Profile Image", type: "image" },
            ],
          },
        ],
      },
      contact: {
        label: "Contact Section",
        removable: true,
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "Get in Touch" },
          { key: "description", label: "Section Description", type: "textarea" },
          { key: "email", label: "Email Address", type: "text" },
          { key: "whatsapp_text", label: "WhatsApp Display Text", type: "text" },
          { key: "whatsapp_link", label: "WhatsApp Link", type: "link" },
        ],
      },
    },
  },

  // Consultations Page
  consultations: {
    label: "Consultations Page",
    sections: {
      hero: {
        label: "Page Header",
        removable: false,
        fields: [
          { key: "badge_text", label: "Badge Text", type: "text", placeholder: "Expert Guidance" },
          { key: "title", label: "Title", type: "text", placeholder: "Book a" },
          { key: "title_highlight", label: "Title Highlight", type: "text", placeholder: "Consultation" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
    },
  },

  // Resources Page
  resources: {
    label: "Resources/Blog Page",
    sections: {
      hero: {
        label: "Page Header",
        removable: false,
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Creator Resources" },
          { key: "subtitle", label: "Subtitle", type: "textarea" },
        ],
      },
    },
  },

  // Shop Page
  shop: {
    label: "Shop Page",
    sections: {
      hero: {
        label: "Page Header",
        removable: false,
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Shop Equipment" },
          { key: "subtitle", label: "Subtitle", type: "textarea" },
        ],
      },
    },
  },

  // Packages Page
  packages: {
    label: "Packages Page",
    sections: {
      hero: {
        label: "Page Header",
        removable: false,
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Equipment Packages" },
          { key: "subtitle", label: "Subtitle", type: "textarea" },
        ],
      },
    },
  },
};

// Helper to get default values for a section
export function getDefaultContent(pageKey: string, sectionKey: string): Record<string, any> {
  const page = CMS_PAGES[pageKey];
  if (!page) return {};

  const section = page.sections[sectionKey];
  if (!section) return {};

  const defaults: Record<string, any> = {};
  section.fields.forEach((field) => {
    if (field.type === "array") {
      defaults[field.key] = [];
    } else {
      defaults[field.key] = field.placeholder || "";
    }
  });

  return defaults;
}

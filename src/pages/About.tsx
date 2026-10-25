import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import SectionHeader from "@/components/layout/SectionHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSectionVisibility } from "@/hooks/usePageContent";
import { z } from "zod";
import {
  Target,
  Users,
  Zap,
  Heart,
  Check,
  ArrowRight,
  Video,
  Headphones,
  Camera,
  Mail,
  MessageSquare,
  Loader2
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
});

const About = () => {
  const { isSectionVisible } = useSectionVisibility("about");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24-48 hours.",
      });

      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us via WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const values = [
    {
      icon: Target,
      title: "Creator-First",
      description: "Every decision we make starts with one question: how does this help Nigerian creators succeed?"
    },
    {
      icon: Zap,
      title: "Quality Matters",
      description: "We source only the best equipment that delivers professional results without breaking the bank."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "We're building more than a store—we're building a community of creators who support each other."
    },
    {
      icon: Users,
      title: "Local Focus",
      description: "We understand the unique challenges Nigerian creators face and design solutions specifically for you."
    }
  ];

  const stats = [
    { number: "500+", label: "Creators Served" },
    { number: "2,000+", label: "Products Delivered" },
    { number: "4.9/5", label: "Customer Rating" },
    { number: "24hrs", label: "Lagos Delivery" }
  ];

  const offerings = [
    {
      icon: Video,
      title: "Video Equipment",
      description: "Cameras, lighting, tripods, and everything you need for stunning video content."
    },
    {
      icon: Headphones,
      title: "Audio Gear",
      description: "Microphones, audio interfaces, and sound equipment for crystal-clear audio."
    },
    {
      icon: Camera,
      title: "Curated Packages",
      description: "Pre-built equipment bundles designed for different creator levels and niches."
    }
  ];

  const testimonials = [
    {
      quote: "Luminate completely transformed my content quality. The equipment package they recommended was perfect for my YouTube channel, and the delivery was super fast!",
      name: "Chioma Adeyemi",
      role: "YouTube Creator",
      followers: "150K subscribers"
    },
    {
      quote: "As a podcaster, audio quality is everything. The team at Luminate helped me pick the perfect mic setup within my budget. My listeners immediately noticed the difference!",
      name: "Oluwaseun Bakare",
      role: "Podcast Host",
      followers: "50K listeners"
    },
    {
      quote: "I was nervous about investing in equipment, but the consultation call gave me confidence. Now I have a professional setup that makes my TikTok videos stand out.",
      name: "Amara Okonkwo",
      role: "TikTok Creator",
      followers: "300K followers"
    }
  ];

  const teamMembers = [
    {
      name: "Adaeze Nwosu",
      role: "Founder & CEO",
      bio: "Former tech executive turned creator advocate. Passionate about empowering the next generation of Nigerian content creators."
    },
    {
      name: "Emeka Obi",
      role: "Head of Operations",
      bio: "Logistics expert ensuring every creator gets their equipment fast and in perfect condition."
    },
    {
      name: "Fatima Hassan",
      role: "Creator Success Lead",
      bio: "Professional videographer helping creators find the perfect equipment for their unique needs."
    }
  ];

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

  return (
    <Layout>
      {/* Hero Section */}
      {isSectionVisible("hero") && (
        <PageHero
          eyebrow="Our story"
          title="Empowering Nigerian creators"
          subtitle="We believe every Nigerian creator deserves access to professional-grade equipment. That's why we created Luminate — to bridge the gap between dreams and reality."
        />
      )}

      {/* Stats Section */}
      {isSectionVisible("stats") && (
      <section className="border-b border-border py-14">
        <div className="container">
          <dl className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                  {stat.number}
                </dt>
                <dd className="mt-2 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      )}

      {/* Mission Section */}
      {isSectionVisible("mission") && (
      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-3">Mission</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Professional gear, without the guesswork.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-lg leading-relaxed text-muted-foreground">
                At Luminate Creators, we're on a mission to democratise access to professional
                content creation equipment for Nigerian creators. We understand the unique
                challenges you face — from finding reliable equipment to navigating import
                complexities.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                That's why we've built a platform that makes it easy to get the gear you need,
                with curated packages designed for every level — from beginners just starting
                out to professionals looking to upgrade their setup.
              </p>
              <ul className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
                {[
                  "Handpicked, quality-tested equipment",
                  "Packages designed for Nigerian creators",
                  "Expert consultations to guide your choices",
                  "Fast, reliable delivery across Nigeria"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Values Section */}
      {isSectionVisible("values") && (
      <section className="section bg-muted/40">
        <div className="container">
          <SectionHeader
            eyebrow="Values"
            title="What guides us"
            subtitle="These principles guide everything we do at Luminate Creators."
          />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {values.map((value) => (
              <div key={value.title} className="border-t border-foreground/15 pt-6">
                <value.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* What We Offer Section */}
      {isSectionVisible("offerings") && (
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Offerings"
            title="What we offer"
            subtitle="Everything you need to take your content to the next level."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {offerings.map((offering) => (
              <div key={offering.title} className="rounded-2xl border border-border p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <offering.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {offering.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {offering.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      {isSectionVisible("testimonials") && (
      <section className="section bg-muted/40">
        <div className="container">
          <SectionHeader
            eyebrow="Testimonials"
            title="What creators say"
            subtitle="Hear from Nigerian creators who have elevated their content with Luminate."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="flex flex-col rounded-2xl border border-border bg-background p-8">
                <blockquote className="flex-1 text-[15px] leading-relaxed text-foreground">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {initials(testimonial.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.followers}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Team Section */}
      {isSectionVisible("team") && (
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Team"
            title="Meet the team"
            subtitle="The passionate people behind Luminate Creators."
          />

          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <span className="text-2xl font-medium text-muted-foreground">
                    {initials(member.name)}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Contact Form Section */}
      {isSectionVisible("contact") && (
      <section id="contact" className="section scroll-mt-16 border-t border-border">
        <div className="container">
          <div className="mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow mb-3">Contact</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Get in touch
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Have questions about our products or need help choosing the right equipment?
                We're here to help.
              </p>

              <dl className="mt-10 space-y-6 border-t border-border pt-8">
                <div className="flex items-start gap-4">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <dt className="font-medium text-foreground">Email</dt>
                    <dd className="text-sm text-muted-foreground">
                      <a href="mailto:hello@luminatecreators.com" className="hover:text-foreground">
                        hello@luminatecreators.com
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MessageSquare className="mt-0.5 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <dt className="font-medium text-foreground">WhatsApp</dt>
                    <dd className="text-sm text-muted-foreground">Quick responses during business hours</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? "border-destructive" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-destructive" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send message"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="section bg-muted/40">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Ready to elevate your content?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join hundreds of Nigerian creators who trust Luminate for their equipment needs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/shop">
                  Browse equipment
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/consultations">Book a consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

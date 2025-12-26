import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  Zap, 
  Heart, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Video,
  Headphones,
  Camera
} from "lucide-react";

const About = () => {
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">Our Story</span>
            </div>

            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Empowering Nigerian{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Creators
              </span>
            </h1>

            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              We believe every Nigerian creator deserves access to professional-grade equipment. 
              That's why we created Luminate—to bridge the gap between dreams and reality.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Luminate Creators, we're on a mission to democratize access to professional 
                content creation equipment for Nigerian creators. We understand the unique 
                challenges you face—from finding reliable equipment to navigating import 
                complexities.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                That's why we've built a platform that makes it easy to get the gear you need, 
                with curated packages designed for every level—from beginners just starting 
                out to professionals looking to upgrade their setup.
              </p>
              <div className="space-y-3">
                {[
                  "Handpicked, quality-tested equipment",
                  "Packages designed for Nigerian creators",
                  "Expert consultations to guide your choices",
                  "Fast, reliable delivery across Nigeria"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Luminate</h3>
                  <p className="text-muted-foreground">Creators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Luminate Creators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-card rounded-xl p-6 border border-border card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take your content to the next level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offerings.map((offering, index) => (
              <div 
                key={index} 
                className="text-center p-8 rounded-xl border border-border bg-card card-hover"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                  <offering.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {offering.title}
                </h3>
                <p className="text-muted-foreground">
                  {offering.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Elevate Your Content?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of Nigerian creators who trust Luminate for their equipment needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                <Link to="/shop">
                  Browse Equipment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/consultations">
                  Book a Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

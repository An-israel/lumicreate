import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import PackageTiers from "@/components/home/PackageTiers";
import HowItWorks from "@/components/home/HowItWorks";
import ResourcesSection from "@/components/home/ResourcesSection";
import FAQ from "@/components/home/FAQ";
import StudioBand from "@/components/home/StudioBand";
import CTABand from "@/components/home/CTABand";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PackageTiers />
      <StudioBand />
      <HowItWorks />
      <ResourcesSection />
      <FAQ />
      <CTABand />
    </Layout>
  );
};

export default Index;

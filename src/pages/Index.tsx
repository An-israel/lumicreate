import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import PackageTiers from "@/components/home/PackageTiers";
import HowItWorks from "@/components/home/HowItWorks";
import ResourcesSection from "@/components/home/ResourcesSection";
import FAQ from "@/components/home/FAQ";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PackageTiers />
      <HowItWorks />
      <ResourcesSection />
      <FAQ />
    </Layout>
  );
};

export default Index;

import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import PackageTiers from "@/components/home/PackageTiers";
import HowItWorks from "@/components/home/HowItWorks";
import CoinSystem from "@/components/home/CoinSystem";
import FAQ from "@/components/home/FAQ";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <PackageTiers />
      <HowItWorks />
      <CoinSystem />
      <FAQ />
    </Layout>
  );
};

export default Index;

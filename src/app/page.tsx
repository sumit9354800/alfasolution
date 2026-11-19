
import HomeHero from "@/components/home/HomeHero";
import HomeMarquee from "@/components/home/HomeMarquee";
import HomeStoryProblem from "@/components/home/HomeStoryProblem";
import HomeIntroSection from "@/components/home/HomeIntroSection";
import HomeStatsBand from "@/components/home/HomeStatsBand";
import HomeServicesSection from "@/components/home/HomeServicesSection";
import HomeCapabilitiesSection from "@/components/home/HomeCapabilitiesSection";
import HomeSelectedWork from "@/components/home/HomeSelectedWork";
import HomeWhyChooseUs from "@/components/home/HomeWhyChooseUs";
import HomeTestimonials from "@/components/home/HomeTestimonials";
import HomeFAQSection from "@/components/home/HomeFAQSection";
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeMarquee />
      <HomeStoryProblem />
      <HomeIntroSection />
      <HomeStatsBand />
      <HomeServicesSection />
      <HomeCapabilitiesSection />
      <HomeSelectedWork />
      <HomeWhyChooseUs />
      <HomeTestimonials />
      <HomeFAQSection />
      

      {/* Next sections will come here */}
    </>
  );
}
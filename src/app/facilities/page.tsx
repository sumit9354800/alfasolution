
import FacilitiesHero from "@/components/facilities/FacilitiesHero";
import FacilitiesPackages from "@/components/facilities/FacilitiesPackages";

export const metadata = {
  title: "Website & App Development Packages",
  description:
    "Explore Alfa Solution's website and application development packages. Compare Basic, Pro and Advanced features.",
};

export default function FacilitiesPage() {
  return (
    <>
      <FacilitiesHero />
      <FacilitiesPackages />
    </>
  );
}

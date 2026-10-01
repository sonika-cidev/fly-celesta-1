import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { About } from "@/components/sections/About";
import { CharterRequest } from "@/components/sections/CharterRequest";
import { Deals } from "@/components/sections/Deals";
import { Fleet } from "@/components/sections/Fleet";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <About />
        <Fleet />
        <Deals />
        <CharterRequest />
      </main>
      <SiteFooter />
    </>
  );
}

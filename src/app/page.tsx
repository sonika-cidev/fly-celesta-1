import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { About } from "@/components/sections/About";
import { Charter } from "@/components/sections/Charter";
import { Deals } from "@/components/sections/Deals";
import { Fleet } from "@/components/sections/Fleet";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Fleet />
        <Deals />
        <Charter />
      </main>
      <Footer />
    </>
  );
}

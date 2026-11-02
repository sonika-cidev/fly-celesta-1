import { Suspense } from "react";
import { About } from "@/components/sections/About";
import { Charter } from "@/components/sections/Charter";
import { Deals } from "@/components/sections/Deals";
import { Faq } from "@/components/sections/Faq";
import { Fleet } from "@/components/sections/Fleet";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Services } from "@/components/sections/Services";
import { featuredFaqs } from "@/data/faq";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <About link={{ label: "More about the company", href: "/about" }} />
      <Fleet />
      <Deals />
      {/* Streams in after the rest of the page; shows nothing until articles are published */}
      <Suspense fallback={null}>
        <LatestPosts />
      </Suspense>
      <Faq items={featuredFaqs} />
      <Charter />
    </>
  );
}

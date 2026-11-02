import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { REGION_PAGES } from "@/data/navigation";
import { services } from "@/data/services";
import { absoluteUrl } from "@/lib/seo";
import { listLivePosts } from "@/lib/server/blog";
import { StoreUnavailableError } from "@/lib/server/store";

type Entry = MetadataRoute.Sitemap[number];

const page = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "monthly"): Entry => ({
  url: absoluteUrl(path),
  changeFrequency,
  priority,
});

/** /sitemap.xml — every public page, and each published blog article. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built per request (outside the try: it stops the build-time render by throwing), so new articles appear
  // straight away and the build never reads a local database.
  await connection();

  let articles: MetadataRoute.Sitemap = [];
  try {
    const { items } = await listLivePosts(1000);
    articles = items.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      ...(post.coverImage ? { images: [absoluteUrl(post.coverImage)] } : {}),
    }));
  } catch (error) {
    if (!(error instanceof StoreUnavailableError)) console.error("[sitemap] could not list blog posts", error);
  }

  return [
    page("/", 1, "weekly"),
    page("/services", 0.9),
    ...services.map((service) => page(`/services/${service.slug}`, 0.9)),
    page("/helicopter-services", 0.9),
    ...REGION_PAGES.map((region) => page(`/helicopter-services/${region.slug}`, 0.9)),
    page("/fleet", 0.8),
    page("/contact", 0.7),
    page("/faq", 0.7),
    page("/blog", 0.7, "weekly"),
    ...articles,
    page("/about", 0.6),
    page("/about/career", 0.5),
  ];
}

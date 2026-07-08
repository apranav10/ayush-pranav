import type { Metadata } from "next";
import { fetchConfig } from "@/lib/cms";
import { Portfolio } from "@/components/Portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfig();
  const title = config.site_name ? `${config.site_name}'s Portfolio` : "Ayush's Portfolio";
  const description = config.meta_description || "Ayush Pranav — Strategy, AI, and OTT professional. MBA @ CMU Tepper.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function Home() {
  return <Portfolio />;
}

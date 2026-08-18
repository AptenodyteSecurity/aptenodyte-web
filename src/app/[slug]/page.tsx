import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { isStubSlug, stubPages } from "@/lib/stubs";

type StubPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(stubPages).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: StubPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isStubSlug(slug)) {
    return { title: "Not found" };
  }

  return {
    title: `${stubPages[slug]} — Aptenodyte`,
    description: "Coming soon.",
  };
}

export default async function StubPage({ params }: StubPageProps) {
  const { slug } = await params;
  if (!isStubSlug(slug)) {
    notFound();
  }

  return <ComingSoon title={stubPages[slug]} />;
}

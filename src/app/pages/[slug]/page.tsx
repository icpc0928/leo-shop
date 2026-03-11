"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { pageAPI } from "@/lib/api";

interface SitePage {
  id: number;
  title: string;
  slug: string;
  content: string;
  enabled: boolean;
}

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await pageAPI.getPublic(slug);
        if (data && !data.error) {
          setPage(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-20">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-md" />
        </div>
      </Container>
    );
  }

  if (notFound) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">找不到頁面</h1>
          <p className="text-gray-500">此頁面尚未建立或已被移除。</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-semibold mb-8">{page!.title}</h1>
        <div
          className="prose prose-gray max-w-none leading-relaxed
            prose-headings:font-serif prose-headings:font-semibold
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:mb-4
            prose-ul:text-gray-600 prose-li:mb-1
            prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: page!.content }}
        />
      </div>
    </Container>
  );
}

"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useTranslations } from "next-intl";
import { faqAPI } from "@/lib/api";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const fallbackFaqs: FaqItem[] = [
  { id: 1, q: "如何下單購買？", a: "瀏覽商品頁面，選擇喜歡的商品後點擊「加入購物車」，然後前往結帳頁面完成訂單。" } as unknown as FaqItem,
];

export default function FAQPage() {
  const t = useTranslations("faq");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faqAPI.getPublic()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        } else {
          setFaqs([]);
        }
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <Breadcrumb items={[{ label: t("title") }]} />
      <div className="py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif tracking-wider mb-2 text-center">
          {t("title")}
        </h1>
        <p className="text-sm text-base-content/60 text-center mb-10">{t("subtitle")}</p>

        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-base-content/40">尚無常見問題</p>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={faq.id} className="collapse collapse-arrow bg-base-200">
                <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
                <div className="collapse-title font-medium">{faq.question}</div>
                <div className="collapse-content">
                  <p className="text-sm text-base-content/70 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

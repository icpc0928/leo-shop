"use client";

import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";

export default function Newsletter() {
  const t = useTranslations("newsletter");

  return (
    <section className="py-20 bg-base-200">
      <Container>
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-serif tracking-wider mb-3">{t("title")}</h2>
          <p className="text-sm text-base-content/60 mb-8">{t("desc")}</p>
          <form className="join w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              aria-label={t("placeholder")}
              placeholder={t("placeholder")}
              className="input input-bordered join-item flex-1"
            />
            <button className="btn btn-primary join-item">{t("subscribe")}</button>
          </form>
        </div>
      </Container>
    </section>
  );
}

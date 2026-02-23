"use client";

import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Heart, Leaf, Award, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const valueIcons = [Heart, Leaf, Award, Users];
const valueKeys = ["curated", "sustainable", "craftsmanship", "community"] as const;

const team = [
  { name: "Leo Chen", role: "Founder & Creative Director", image: "https://picsum.photos/seed/team1/300/300" },
  { name: "Sophia Lin", role: "Product Curator", image: "https://picsum.photos/seed/team2/300/300" },
  { name: "James Wu", role: "Operations Manager", image: "https://picsum.photos/seed/team3/300/300" },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <>
      <div
        className="relative flex items-center justify-center min-h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: "url(https://picsum.photos/seed/about-hero/1600/800)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl lg:text-5xl font-serif tracking-wider mb-4">{t("title")}</h1>
          <p className="max-w-lg mx-auto opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <Container>
        <Breadcrumb items={[{ label: t("title") }]} />

        <section className="py-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-serif tracking-wider mb-6">{t("ourStory")}</h2>
          <div className="text-muted leading-relaxed space-y-4">
            <p>{t("story1")}</p>
            <p>{t("story2")}</p>
            <p>{t("story3")}</p>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <h2 className="text-2xl font-serif tracking-wider mb-12 text-center">{t("ourValues")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {valueKeys.map((key, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={key} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center border border-primary rounded-full text-primary">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-medium mb-2">{t(`values.${key}.title`)}</h3>
                  <p className="text-sm text-muted leading-relaxed">{t(`values.${key}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <h2 className="text-2xl font-serif tracking-wider mb-12 text-center">{t("ourTeam")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {team.map((m) => (
              <div key={m.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-[#f5f0eb]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium">{m.name}</h3>
                <p className="text-sm text-muted">{m.role}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

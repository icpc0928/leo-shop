"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Button from "@/components/ui/CustomButton";
import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("contact");

  const contactInfo = [
    { icon: MapPin, label: t("address"), value: "台北市信義區某某路 100 號" },
    { icon: Phone, label: t("phone"), value: "+886 2 1234 5678" },
    { icon: Mail, label: t("emailLabel"), value: "info@leoshop.com" },
    { icon: Clock, label: t("hours"), value: "Mon - Fri: 10:00 - 19:00\nSat - Sun: 11:00 - 18:00" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    "w-full px-4 py-3 border border-border text-sm focus:outline-none focus:border-foreground transition-colors";

  return (
    <Container>
      <Breadcrumb items={[{ label: t("title") }]} />
      <h1 className="text-3xl font-serif tracking-wider mb-12 pt-4 text-center">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto pb-16">
        <div>
          {submitted ? (
            <div className="text-center py-16">
              <p className="text-lg mb-2">{t("thankYou")}</p>
              <p className="text-muted text-sm">{t("replyNote")}</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder={t("name")} required className={inputClass} />
                <input type="email" placeholder={t("email")} required className={inputClass} />
              </div>
              <input type="text" placeholder={t("subject")} className={inputClass} />
              <textarea
                placeholder={t("message")}
                rows={6}
                required
                className={`${inputClass} resize-none`}
              />
              <Button className="w-full">{t("send")}</Button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-sm font-medium tracking-wider">{t("getInTouch")}</h2>
          {contactInfo.map((item) => (
            <div key={item.label} className="flex gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-border text-primary">
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">{item.label}</p>
                <p className="text-sm text-muted whitespace-pre-line">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

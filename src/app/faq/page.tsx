"use client";

import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useTranslations } from "next-intl";

const faqs = [
  { q: "如何下單購買？", a: "瀏覽商品頁面，選擇喜歡的商品後點擊「加入購物車」，然後前往結帳頁面完成訂單。我們支援多種付款方式，讓您輕鬆完成購買。" },
  { q: "運送需要多久？", a: "台灣本島一般 2-3 個工作天送達，離島地區約 5-7 個工作天。我們與多家物流公司合作，確保商品安全準時送達。" },
  { q: "可以退換貨嗎？", a: "收到商品後 7 天內可申請退換貨，商品需保持全新未使用狀態並附上完整包裝。退貨運費由買家負擔，換貨運費由我們承擔。" },
  { q: "有哪些付款方式？", a: "目前支援信用卡（Visa / MasterCard / JCB）、ATM 轉帳、超商付款及 LINE Pay。所有交易皆經過加密處理，保障您的付款安全。" },
  { q: "如何追蹤我的訂單？", a: "完成下單後，您會收到訂單確認信件，內含物流追蹤連結。您也可以在會員中心的「我的訂單」查看即時配送狀態。" },
  { q: "商品可以包裝成禮物嗎？", a: "可以！結帳時勾選「禮物包裝」選項，我們會使用精美的包裝紙和緞帶為您包裝，另可附上手寫小卡片（免費服務）。" },
  { q: "有實體店面嗎？", a: "我們目前在台北信義區設有一間實體體驗店，歡迎前來逛逛。營業時間為週一至週五 10:00-19:00，週末 11:00-18:00。" },
  { q: "如何聯繫客服？", a: "您可以透過聯絡我們頁面的表單留言，或直接寄信至 info@leoshop.com。我們會在一個工作天內回覆您。" },
];

export default function FAQPage() {
  const t = useTranslations("faq");

  return (
    <Container>
      <Breadcrumb items={[{ label: t("title") }]} />
      <div className="py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif tracking-wider mb-2 text-center">
          {t("title")}
        </h1>
        <p className="text-sm text-base-content/60 text-center mb-10">{t("subtitle")}</p>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
              <div className="collapse-title font-medium">{faq.q}</div>
              <div className="collapse-content">
                <p className="text-sm text-base-content/70 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

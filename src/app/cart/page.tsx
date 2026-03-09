"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useCartStore } from "@/stores/cartStore";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useCurrency();
  const t = useTranslations("cart");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const shipping = totalPrice() >= 2000 ? 0 : 120;
  const total = totalPrice() + shipping;

  if (items.length === 0) {
    return (
      <Container>
        <Breadcrumb items={[{ label: t("title") }]} />
        <div className="py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-base-content/20 mb-6" strokeWidth={1} />
          <h1 className="text-3xl font-serif tracking-wider mb-4">{t("empty")}</h1>
          <p className="text-base-content/60 mb-8">{t("emptyDesc")}</p>
          <Link href="/products" className="inline-flex items-center px-6 py-2.5 border border-base-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">{t("continueShopping")}</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumb items={[{ label: t("title") }]} />
      <h1 className="text-3xl font-serif tracking-wider mb-8 pt-4">{t("title")}</h1>

      <div className="lg:flex lg:gap-12">
        <div className="flex-1 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{t("product")}</th>
                <th className="text-center">{t("price")}</th>
                <th className="text-center">{t("quantityLabel")}</th>
                <th className="text-center">{t("subtotalLabel")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.product.id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <Image src={item.product.images?.[0] || item.product.imageUrl || '/placeholder.png'} alt={item.product.name} fill className="object-cover rounded" />
                      </div>
                      <div>
                        <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-primary transition-colors text-sm">
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-base-content/50 mt-0.5">{item.product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-sm">{formatPrice(item.product.price)}</td>
                  <td>
                    <div className="flex items-center justify-center gap-0">
                      <button className="w-8 h-8 flex items-center justify-center border border-base-300 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity">
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-y border-base-300 bg-white text-sm">{item.quantity}</span>
                      <button className="w-8 h-8 flex items-center justify-center border border-base-300 rounded-r-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Increase quantity">
                        <Plus className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                  <td className="text-center text-sm font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </td>
                  <td>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <button onClick={clearCart} className="text-sm text-base-content/60 hover:text-base-content transition-colors cursor-pointer">
              {t("clearCart")}
            </button>
            <Link href="/products" className="text-sm text-base-content/60 hover:text-base-content transition-colors">
              {t("continueShopping")} →
            </Link>
          </div>
        </div>

        <div className="lg:w-80 mt-8 lg:mt-0">
          <div className="border border-base-200 rounded-2xl">
            <div className="p-6">
              <h2 className="text-sm font-semibold tracking-wider mb-4">{t("orderSummary")}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">{t("subtotal")}</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">{t("shipping")}</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-base-content/50">{t("freeShippingNote")}</p>
                )}
                <div className="divider my-0" />
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="block mt-4 w-full text-center bg-[var(--home2-primary,#c8956c)] py-3 text-sm tracking-wider hover:opacity-90 transition-opacity rounded-xl cursor-pointer" style={{ color: '#fff', fontWeight: 600 }}>
                {t("proceedToCheckout")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

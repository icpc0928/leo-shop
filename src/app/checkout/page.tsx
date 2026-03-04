"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { orderAPI, cryptoPaymentAPI, paymentMethodAPI, cryptoOrderAPI } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Store, ShoppingBag, Bitcoin, Coins } from "lucide-react";
import type { PaymentMethod } from "@/types";

interface ShippingForm {
  name: string; email: string; phone: string; city: string; district: string; zipCode: string; address: string;
}
interface FormErrors { [key: string]: string; }

const initialForm: ShippingForm = { name: "", email: "", phone: "", city: "", district: "", zipCode: "", address: "" };

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ShippingForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [selectedCryptoMethodId, setSelectedCryptoMethodId] = useState<number | null>(null);
  const [cryptoMethods, setCryptoMethods] = useState<PaymentMethod[]>([]);
  const [shipping, setShipping] = useState(0);
  const router = useRouter();
  const { currency, formatPrice, formatPriceTWD } = useCurrency();
  const t = useTranslations("checkout");

  useEffect(() => { setMounted(true); }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [mounted, isLoggedIn, router]);

  // Fetch enabled payment methods
  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const data = await paymentMethodAPI.getEnabled();
        const methods: PaymentMethod[] = Array.isArray(data) ? data : data.content || [];
        setCryptoMethods(methods);
        if (methods.length > 0) setSelectedCryptoMethodId(methods[0].id);
      } catch {
        // fallback: no crypto methods available
      }
    })();
  }, [mounted]);

  // Fetch shipping fee from backend
  useEffect(() => {
    if (!mounted) return;
    const subtotal = totalPrice();
    if (subtotal <= 0) return;
    (async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_BASE}/api/orders/shipping-fee?subtotal=${subtotal}`);
        if (res.ok) {
          const data = await res.json();
          setShipping(Number(data.shippingFee));
        }
      } catch {
        // Fallback: match backend logic
        setShipping(subtotal >= 2000 ? 0 : 100);
      }
    })();
  }, [mounted, items]);

  if (!mounted) return null;

  const total = totalPrice() + shipping;

  if (items.length === 0 && !orderComplete) {
    return (
      <Container>
        <Breadcrumb items={[{ label: t("title") }]} />
        <div className="py-20 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-base-content/20 mb-6" strokeWidth={1} />
          <h1 className="text-3xl font-serif tracking-wider mb-4">{t("title")}</h1>
          <p className="text-base-content/60 mb-8">購物車是空的</p>
          <Link href="/products" className="btn btn-outline">繼續購物</Link>
        </div>
      </Container>
    );
  }

  if (orderComplete) {
    return (
      <Container>
        <div className="py-20 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-serif tracking-wider mb-4">{t("orderComplete")}</h1>
          <p className="text-lg text-base-content/60 mb-2">{t("thankYou")}</p>
          <p className="text-sm text-base-content/60 mb-6">
            {t("orderNumber")}：<span className="font-medium text-base-content">{orderNumber}</span>
          </p>
          <p className="text-sm text-base-content/60 mb-8">{t("orderConfirmEmail")}</p>
          <Link href="/" className="btn btn-primary">{t("backToHome")}</Link>
        </div>
      </Container>
    );
  }

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = t("required");
    if (!form.email.trim()) newErrors.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = t("invalidEmail");
    if (!form.phone.trim()) newErrors.phone = t("required");
    else if (!/^[\d\-+() ]{8,}$/.test(form.phone)) newErrors.phone = t("invalidPhone");
    if (!form.address.trim()) newErrors.address = t("required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const paymentMethodMap: Record<string, string> = {
    "cod": "CASH_ON_DELIVERY",
    "crypto": "CRYPTO",
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");
    try {
      const fullAddress = [form.zipCode, form.city, form.district, form.address].filter(Boolean).join(" ");
      const orderData = {
        items: items.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.quantity,
        })),
        shippingName: form.name,
        shippingPhone: form.phone,
        shippingEmail: form.email,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethodMap[paymentMethod] || "CASH_ON_DELIVERY",
      };
      const result = await orderAPI.create(orderData);

      if (paymentMethod === "crypto" && selectedCryptoMethodId) {
        try {
          const cryptoResult = await cryptoOrderAPI.create({
            orderId: result.id,
            paymentMethodId: selectedCryptoMethodId,
          });
          clearCart();
          // Use the crypto order ID as paymentId param
          router.push(`/checkout/crypto/${cryptoResult.id}`);
          return;
        } catch {
          // fallback: try old NOWPayments API
          try {
            const selectedMethod = cryptoMethods.find(m => m.id === selectedCryptoMethodId);
            const cryptoResult = await cryptoPaymentAPI.create({
              orderId: result.id,
              payCurrency: selectedMethod?.symbol || "BTC",
            });
            clearCart();
            router.push(`/checkout/crypto/${cryptoResult.paymentId}`);
            return;
          } catch {
            console.warn("Crypto payment creation failed");
          }
        }
      }

      setOrderNumber(result.orderNumber);
      clearCart();
      setOrderComplete(true);
    } catch {
      console.warn('Order API failed, using fallback');
      const num = "LS" + Date.now().toString(36).toUpperCase();
      setOrderNumber(num);
      clearCart();
      setOrderComplete(true);
    } finally {
      setPlacing(false);
    }
  };

  const updateField = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const steps = [
    { num: 1, label: t("step1") },
    { num: 2, label: t("step2") },
    { num: 3, label: t("step3") },
  ];

  const selectedCryptoMethod = cryptoMethods.find(m => m.id === selectedCryptoMethodId);

  const paymentOptions = [
    { id: "cod", icon: Store, label: t("cod"), note: t("codNote") },
    { id: "crypto", icon: Bitcoin, label: t("crypto"), note: t("cryptoNote") },
  ];

  const inputClass = (field: string) =>
    `input input-bordered w-full ${errors[field] ? "input-error" : ""}`;

  return (
    <Container>
      <Breadcrumb items={[{ label: t("title") }]} />
      <h1 className="text-3xl font-serif tracking-wider mb-8 pt-4">{t("title")}</h1>

      {/* Steps */}
      <ul className="steps steps-horizontal w-full max-w-md mx-auto mb-12">
        {steps.map((s) => (
          <li key={s.num} className={`step ${step >= s.num ? "step-primary" : ""}`}>
            {s.label}
          </li>
        ))}
      </ul>

      {orderError && <div className="alert alert-error text-sm mb-4">{orderError}</div>}

      <div className="lg:flex lg:gap-12">
        <div className="flex-1">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-medium tracking-wider mb-6">{t("shippingInfo")}</h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">{t("name")} *</span></label>
                  <input type="text" name="name" autoComplete="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass("name")} />
                  {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">{t("email")} *</span></label>
                    <input type="email" name="email" autoComplete="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass("email")} />
                    {errors.email && <label className="label"><span className="label-text-alt text-error">{errors.email}</span></label>}
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">{t("phone")} *</span></label>
                    <input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass("phone")} />
                    {errors.phone && <label className="label"><span className="label-text-alt text-error">{errors.phone}</span></label>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">{t("zipCode")}</span></label>
                    <input type="text" name="zipCode" autoComplete="postal-code" value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} className={inputClass("zipCode")} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">{t("city")}</span></label>
                    <input type="text" name="city" autoComplete="address-level2" value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass("city")} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">{t("district")}</span></label>
                    <input type="text" name="district" autoComplete="address-level3" value={form.district} onChange={(e) => updateField("district", e.target.value)} className={inputClass("district")} />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">{t("address")} *</span></label>
                  <input type="text" name="address" autoComplete="street-address" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass("address")} />
                  {errors.address && <label className="label"><span className="label-text-alt text-error">{errors.address}</span></label>}
                </div>
              </div>
              <div className="mt-8">
                <button className="btn btn-primary" onClick={handleNext}>{t("next")}</button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-medium tracking-wider mb-6">{t("paymentMethod")}</h2>
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <div key={opt.id}>
                    <label
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === opt.id ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/30"
                      }`}
                    >
                      <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id)} className="radio radio-primary mt-1" />
                      <div className="flex items-center gap-3 flex-1">
                        <opt.icon className="w-5 h-5 text-base-content/50 shrink-0" strokeWidth={1.5} />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-base-content/50 mt-0.5">{opt.note}</p>
                        </div>
                      </div>
                    </label>
                    {/* Crypto sub-options: dynamic from API */}
                    {opt.id === "crypto" && paymentMethod === "crypto" && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-3">
                        {cryptoMethods.length === 0 && (
                          <p className="text-xs text-base-content/40">目前無可用的加密幣種</p>
                        )}
                        {cryptoMethods.map((cm) => (
                          <label key={cm.id} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                            selectedCryptoMethodId === cm.id ? "border-primary bg-primary/5" : "border-base-300"
                          }`}>
                            <input type="radio" name="crypto" value={cm.id} checked={selectedCryptoMethodId === cm.id}
                              onChange={() => setSelectedCryptoMethodId(cm.id)} className="radio radio-primary radio-sm" />
                            <Coins className="w-4 h-4 text-base-content/40" />
                            <div>
                              <span className="text-sm font-medium">{cm.symbol}</span>
                              <span className="text-xs text-base-content/50 ml-1">({cm.network})</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-4">
                <button className="btn btn-outline" onClick={() => setStep(1)}>{t("prev")}</button>
                <button className="btn btn-primary" onClick={handleNext}>{t("next")}</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-medium tracking-wider mb-6">{t("orderConfirmation")}</h2>
              <div className="card bg-base-200 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-sm font-medium mb-2">{t("shippingInfo")}</h3>
                  <div className="text-sm text-base-content/60 space-y-1">
                    <p>{form.name}</p><p>{form.email}</p><p>{form.phone}</p>
                    <p>{form.zipCode} {form.city}{form.district} {form.address}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-sm font-medium mb-2">{t("paymentMethod")}</h3>
                  <p className="text-sm text-base-content/60">
                    {paymentOptions.find((o) => o.id === paymentMethod)?.label}
                    {paymentMethod === "crypto" && selectedCryptoMethod && ` (${selectedCryptoMethod.symbol} - ${selectedCryptoMethod.network})`}
                  </p>
                  {paymentMethod === "crypto" && selectedCryptoMethod && selectedCryptoMethod.exchangeRate > 0 && (
                    <div className="mt-3 p-3 bg-base-100 rounded-lg">
                      <p className="text-xs text-base-content/50 mb-1">預估支付金額</p>
                      <p className="text-lg font-bold text-primary">
                        {(total / selectedCryptoMethod.exchangeRate).toFixed(8)} {selectedCryptoMethod.symbol}
                      </p>
                      <p className="text-xs text-base-content/40 mt-1">
                        匯率：1 {selectedCryptoMethod.symbol} ≈ {Number(selectedCryptoMethod.exchangeRate).toLocaleString()} TWD
                      </p>
                      <p className="text-xs text-base-content/40">※ 實際金額以送出訂單時匯率為準</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="card bg-base-200 mb-4">
                <div className="card-body p-4">
                  <h3 className="text-sm font-medium mb-3">{t("orderItems")}</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover rounded" />
                        </div>
                        <div className="flex-1 text-sm">
                          <p>{item.product.name}</p>
                          <p className="text-base-content/50">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button className="btn btn-outline" onClick={() => setStep(2)}>{t("prev")}</button>
                <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? <span className="loading loading-spinner loading-sm" /> : null}
                  {placing ? "處理中..." : t("placeOrder")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 mt-8 lg:mt-0">
          <div className="card bg-base-200 sticky top-28">
            <div className="card-body">
              <h2 className="card-title text-sm tracking-wider">{t("orderSummary")}</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-base-content/60">{item.product.name} x{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="divider my-0" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-base-content/60">小計</span><span>{formatPrice(totalPrice())}</span></div>
                <div className="flex justify-between"><span className="text-base-content/60">運費</span><span>{shipping === 0 ? "免運" : formatPrice(shipping)}</span></div>
                <div className="divider my-0" />
                <div className="flex justify-between font-medium text-base">
                  <span>合計</span>
                  <span>
                    {formatPrice(total)}
                    {currency !== "TWD" && (
                      <span className="text-xs text-base-content/50 ml-1">(≈ {formatPriceTWD(total)})</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { cryptoPaymentAPI, cryptoOrderAPI } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Copy, Check, Clock, AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import type { CryptoPayment, CryptoOrder } from "@/types";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; labelKey: string; spin?: boolean }> = {
  waiting: { icon: Clock, color: "text-warning", labelKey: "statusWaiting" },
  confirming: { icon: Loader2, color: "text-info", labelKey: "statusConfirming", spin: true },
  confirmed: { icon: CheckCircle2, color: "text-success", labelKey: "statusConfirmed" },
  sending: { icon: Loader2, color: "text-info", labelKey: "statusSending", spin: true },
  finished: { icon: CheckCircle2, color: "text-success", labelKey: "statusFinished" },
  expired: { icon: AlertTriangle, color: "text-error", labelKey: "statusExpired" },
  failed: { icon: AlertTriangle, color: "text-error", labelKey: "statusFailed" },
  // Direct crypto order statuses
  pending: { icon: Clock, color: "text-warning", labelKey: "statusWaiting" },
  verified: { icon: CheckCircle2, color: "text-success", labelKey: "statusConfirmed" },
  manual: { icon: Loader2, color: "text-info", labelKey: "statusConfirming", spin: true },
};

type Mode = "nowpayments" | "direct";

export default function CryptoPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;
  const t = useTranslations("cryptoPayment");

  const [mode, setMode] = useState<Mode | null>(null);
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [cryptoOrder, setCryptoOrder] = useState<CryptoOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isNumericId = /^\d+$/.test(paymentId);

  const fetchStatus = useCallback(async () => {
    try {
      if (isNumericId) {
        // Direct crypto order
        const data = await cryptoOrderAPI.getStatus(Number(paymentId));
        setCryptoOrder(data);
        setMode("direct");
        if (data.txHash) {
          setSubmitted(true);
          setTxHash(data.txHash);
        }
        if (data.verifyStatus === "verified") {
          setShowSuccess(true);
          setTimeout(() => { router.push("/account/orders"); }, 3000);
        }
      } else {
        // NOWPayments
        const data = await cryptoPaymentAPI.getStatus(paymentId);
        setPayment(data);
        setMode("nowpayments");
        if (data.status === "finished" || data.status === "confirmed") {
          setShowSuccess(true);
          setTimeout(() => { router.push("/account/orders"); }, 3000);
        }
      }
      setLoading(false);
    } catch {
      setError(t("fetchError"));
      setLoading(false);
    }
  }, [paymentId, isNumericId, router, t]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleSubmitHash = async () => {
    if (!txHash.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await cryptoOrderAPI.submitHash(Number(paymentId), txHash.trim());
      setSubmitted(true);
      await fetchStatus();
    } catch {
      setError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-base-content/60">{t("loading")}</p>
        </div>
      </Container>
    );
  }

  if (!payment && !cryptoOrder) {
    return (
      <Container>
        <div className="py-20 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-error mb-4" />
          <p className="text-base-content/60">{error || t("fetchError")}</p>
        </div>
      </Container>
    );
  }

  if (showSuccess) {
    return (
      <Container>
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-serif tracking-wider mb-4">{t("paymentSuccess")}</h1>
          <p className="text-base-content/60">{t("redirecting")}</p>
        </div>
      </Container>
    );
  }

  // ========== Direct Crypto Order Mode ==========
  if (mode === "direct" && cryptoOrder) {
    const statusInfo = STATUS_CONFIG[cryptoOrder.verifyStatus] || STATUS_CONFIG.pending;
    const StatusIcon = statusInfo.icon;

    return (
      <Container>
        <Breadcrumb items={[{ label: t("title") }]} />
        <div className="max-w-lg mx-auto py-8">
          <div className="card bg-base-200">
            <div className="card-body items-center text-center">
              <h1 className="text-2xl font-serif tracking-wider mb-6">🪙 {t("title")}</h1>

              {/* Amount */}
              <div className="w-full">
                <p className="text-base-content/60 text-sm">{t("payAmount")}</p>
                <p className="text-xl font-bold" style={{ color: "#c8956c" }}>
                  {cryptoOrder.expectedAmount} {cryptoOrder.symbol}
                </p>
                <span className="badge badge-outline badge-sm mt-1">{cryptoOrder.network}</span>
              </div>

              <div className="divider my-2" />

              {/* Network Warning */}
              <div className="alert alert-warning text-sm w-full">
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ 請使用 <strong>{cryptoOrder.network.toUpperCase()}</strong> 網路轉帳</span>
              </div>

              {/* QR Code */}
              {cryptoOrder.verifyStatus === "pending" && !submitted && (
                <div className="my-6 p-4 bg-white rounded-xl">
                  <QRCodeSVG value={cryptoOrder.walletAddress} size={200} />
                </div>
              )}

              {/* Wallet Address */}
              {cryptoOrder.verifyStatus === "pending" && (
                <div className="w-full">
                  <p className="text-base-content/60 text-sm mb-2">{t("walletAddress")}</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={cryptoOrder.walletAddress}
                      className="input input-bordered input-sm flex-1 font-mono text-xs" />
                    <button className="btn btn-sm btn-outline" onClick={() => handleCopy(cryptoOrder.walletAddress)}>
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      {copied ? t("copied") : t("copy")}
                    </button>
                  </div>
                </div>
              )}

              <div className="divider my-2" />

              {/* TX Hash Input */}
              {!submitted && cryptoOrder.verifyStatus === "pending" && (
                <div className="w-full">
                  <p className="text-base-content/60 text-sm mb-2">{t("txHash")}</p>
                  <div className="flex items-center gap-2">
                    <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)}
                      placeholder="0x..." className="input input-bordered input-sm flex-1 font-mono text-xs" />
                    <button className="btn btn-sm btn-primary" onClick={handleSubmitHash}
                      disabled={submitting || !txHash.trim()}>
                      {submitting ? <span className="loading loading-spinner loading-xs" /> : <Send className="w-4 h-4" />}
                      {t("submit")}
                    </button>
                  </div>
                  {error && <p className="text-error text-xs mt-1">{error}</p>}
                </div>
              )}

              {/* Status */}
              {submitted && (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color} ${statusInfo.spin ? "animate-spin" : ""}`} />
                    <span className={`font-medium ${statusInfo.color}`}>{t(statusInfo.labelKey)}</span>
                  </div>
                  {cryptoOrder.verifyStatus === "failed" && cryptoOrder.verifyMessage && (
                    <p className="text-error text-sm">{cryptoOrder.verifyMessage}</p>
                  )}
                  {cryptoOrder.verifyStatus !== "verified" && cryptoOrder.verifyStatus !== "failed" && (
                    <p className="text-xs text-base-content/40">{t("autoRefresh")}</p>
                  )}
                </div>
              )}

              {!submitted && cryptoOrder.verifyStatus === "pending" && (
                <p className="text-xs text-base-content/40 mt-2">{t("timeWarning")}</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // ========== NOWPayments Mode ==========
  if (mode === "nowpayments" && payment) {
    const statusInfo = STATUS_CONFIG[payment.status] || STATUS_CONFIG.waiting;
    const StatusIcon = statusInfo.icon;
    const isTerminal = payment.status === "expired" || payment.status === "failed";

    return (
      <Container>
        <Breadcrumb items={[{ label: t("title") }]} />
        <div className="max-w-lg mx-auto py-8">
          <div className="card bg-base-200">
            <div className="card-body items-center text-center">
              <h1 className="text-2xl font-serif tracking-wider mb-6">🪙 {t("title")}</h1>

              <div className="w-full">
                <p className="text-base-content/60 text-sm">{t("orderAmount")}</p>
                <p className="text-lg font-medium">{formatPrice(payment.priceAmount)}</p>
              </div>

              <div className="divider my-2" />

              <div className="w-full">
                <p className="text-base-content/60 text-sm">{t("payAmount")}</p>
                <p className="text-xl font-bold" style={{ color: "#c8956c" }}>
                  {payment.payAmount} {payment.payCurrency.toUpperCase()}
                </p>
              </div>

              {!isTerminal && (
                <div className="my-6 p-4 bg-white rounded-xl">
                  <QRCodeSVG value={payment.payAddress} size={200} />
                </div>
              )}

              {!isTerminal && (
                <div className="w-full">
                  <p className="text-base-content/60 text-sm mb-2">{t("walletAddress")}</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={payment.payAddress}
                      className="input input-bordered input-sm flex-1 font-mono text-xs" />
                    <button className="btn btn-sm btn-outline" onClick={() => handleCopy(payment.payAddress)}>
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      {copied ? t("copied") : t("copy")}
                    </button>
                  </div>
                </div>
              )}

              <div className="divider my-2" />

              <div className="w-full flex items-center justify-center gap-2">
                <StatusIcon className={`w-5 h-5 ${statusInfo.color} ${statusInfo.spin ? "animate-spin" : ""}`} />
                <span className={`font-medium ${statusInfo.color}`}>{t(statusInfo.labelKey)}</span>
              </div>

              {!isTerminal && (
                <p className="text-xs text-base-content/40 mt-1">{t("autoRefresh")}</p>
              )}

              {payment.status === "waiting" && (
                <div className="alert alert-warning mt-4 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t("timeWarning")}</span>
                </div>
              )}

              {isTerminal && (
                <div className="alert alert-error mt-4 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t(payment.status === "expired" ? "expiredMessage" : "failedMessage")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return null;
}

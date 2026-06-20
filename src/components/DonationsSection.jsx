import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

const WALLETS = [
  {
    label: "ETH",
    symbol: "ETH",
    address: "0x66184fa219Dc0b60dDD81452EcB451840ccB8764",
    color: "#6366f1",
    note: "Ethereum Network",
  },
  {
    label: "BTC",
    symbol: "BTC",
    address: "bc1qg5jzd4xcyq4awg5r58p6ml4uu23lqadcyc5gk0",
    color: "#f59e0b",
    note: "Bitcoin",
  },
  {
    label: "USDT",
    symbol: "USDT",
    address: "0x66184fa219Dc0b60dDD81452EcB451840ccB8764",
    color: "#22c55e",
    note: "ERC-20 · ETH Network",
  },
  {
    label: "XMR",
    symbol: "XMR",
    address: "84mHnjk51HwFVaWXQDpTLCSTYJXjTtTCTWv33bSJXDRwYFv3ScENqcy68oF55tVpVXZ9LxJCVyzfEjXQ978caFHdLVuvbh7",
    color: "#f97316",
    note: "Monero",
  },
  {
    label: "SOL",
    symbol: "SOL",
    address: "Htx9Mbm39Cz3x97xo6aPyEPPQd4XLbwq1KHHgQboTfsN",
    color: "#a78bfa",
    note: "Solana Network",
  },
];

const fadeUpView = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

function WalletRow({ wallet, index }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = wallet.address.length > 24
    ? `${wallet.address.slice(0, 12)}...${wallet.address.slice(-8)}`
    : wallet.address;

  return (
    <motion.div
      {...fadeUpView(index * 0.07)}
      className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 cursor-pointer"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      whileHover={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.035)" }}
      onClick={copy}
    >
      {/* Token badge */}
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[11px]"
        style={{ background: `${wallet.color}15`, border: `1px solid ${wallet.color}25`, color: wallet.color }}
      >
        {wallet.symbol}
      </div>

      {/* Address info */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-mono text-white/25 mb-0.5">{wallet.note}</div>
        <div className="font-mono text-[12px] text-white/55 truncate">{shortAddr}</div>
      </div>

      {/* Full address (hidden on small, visible on hover for desktop) */}
      <div className="hidden lg:block font-mono text-[10px] text-white/20 max-w-[200px] truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {wallet.address}
      </div>

      {/* Copy button */}
      <button
        onClick={e => { e.stopPropagation(); copy(); }}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
        style={{ background: copied ? `${wallet.color}15` : "rgba(255,255,255,0.04)", border: copied ? `1px solid ${wallet.color}30` : "1px solid rgba(255,255,255,0.06)" }}
      >
        {copied
          ? <Check className="w-3.5 h-3.5" style={{ color: wallet.color }} />
          : <Copy className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition-colors" />
        }
      </button>
    </motion.div>
  );
}

export default function DonationsSection() {
  return (
    <section className="py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUpView()} className="text-center mb-16">
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-tight tracking-tight mb-4">
            Help keep Ghost running.
          </h2>
          <p className="text-[14px] leading-relaxed max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            Ghost has no paywalls, no subscriptions, no ads. It runs on real infrastructure with real costs.
            If it saved you money on tickets — or just if you believe in the mission — sending anything keeps the lights on.
          </p>
        </motion.div>

        {/* Wallet list */}
        <div className="space-y-2 mb-10">
          {WALLETS.map((wallet, i) => (
            <WalletRow key={wallet.symbol} wallet={wallet} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          {...fadeUpView(0.35)}
          className="text-center text-[11px] font-mono"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          Click any row to copy the wallet address. Every satoshi, wei, and lamport matters.
        </motion.p>
      </div>
    </section>
  );
}
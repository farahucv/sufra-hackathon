import { t } from "@/lib/i18n";

/** Branded Sufra Ready-to-Cook Box: cream carton, date-brown wordmark, olive Sadu band. */
export function BoxArt({ title, serv, size = "md", img }: { title: string; serv: number; size?: "sm" | "md" | "lg"; img?: string }) {
  const dims = { sm: "w-full aspect-[5/3]", md: "w-full aspect-[5/3]", lg: "w-full aspect-[4/3]" }[size];
  const big = size === "lg";
  return (
    <div className={`relative ${dims}`} aria-label={t("صندوق {x}", { x: title })}>
      {/* lid */}
      <div className="absolute inset-x-[4%] top-0 h-[16%] rounded-t-xl bg-sand" style={{ clipPath: "polygon(3% 100%, 0 0, 100% 0, 97% 100%)" }} />
      {/* front */}
      <div className="sadu absolute inset-x-0 bottom-0 top-[13%] overflow-hidden rounded-xl bg-card shadow-soft ring-1 ring-primary/10">
        <div className="sadu-band absolute inset-x-0 top-0 h-[9px] opacity-80" />
        <div className={`absolute inset-0 flex flex-col justify-between ${big ? "p-6" : "p-3.5"}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-primary">
              <p className={`font-display leading-none ${big ? "text-4xl" : "text-xl"}`}>{t("سُفرة")}</p>
              <p className={`mt-1 font-medium tracking-[0.28em] opacity-70 ${big ? "text-[10px]" : "text-[8px]"}`}>READY-TO-COOK BOX</p>
            </div>
            {img && <img src={img} alt="" className={`rounded-full object-cover ring-2 ring-card ${big ? "h-20 w-20" : "h-11 w-11"}`} width={80} height={80} loading="lazy" />}
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className={`min-w-0 truncate font-display text-foreground ${big ? "text-2xl" : "text-sm"}`}>{t(title)}</p>
            <span className={`shrink-0 rounded-full bg-olive font-semibold text-olive-foreground ${big ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"}`}>{t("{n} حصص", { n: serv })}</span>
          </div>
        </div>
        {/* tape seam */}
        <div className="absolute inset-y-0 start-1/2 w-[10%] -translate-x-1/2 bg-sand/50 rtl:translate-x-1/2" />
      </div>
    </div>
  );
}

/** Tangible "packaging" visual for a Ready-to-Cook box. */
export function BoxArt({ img, title, serv, compact }: { img: string; title: string; serv: number; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-primary text-primary-foreground ${compact ? "h-36" : "h-56 lg:h-64"}`}>
      <img src={img} alt={title} className="absolute inset-y-0 start-0 h-full w-1/2 object-cover opacity-90" loading="lazy" width={384} height={384} />
      <div className="absolute inset-y-0 start-[calc(50%-1.5rem)] w-12 bg-gradient-to-l from-primary to-transparent rtl:bg-gradient-to-r" />
      {/* tape */}
      <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 bg-gold/80" />
      <div className="relative ms-[50%] flex h-full flex-col justify-between p-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] opacity-70">READY-TO-COOK</p>
          <p className="mt-1 font-display text-lg leading-tight lg:text-2xl">صندوق {title}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-primary/80 px-2 py-1 text-[11px]">
          <span>{serv} حصص</span><span className="opacity-80">سُفرة · طازج</span>
        </div>
      </div>
    </div>
  );
}

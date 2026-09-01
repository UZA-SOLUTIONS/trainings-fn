import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BANK_REQUIREMENTS, OBSTACLES, depositRequirement } from "@/constants/bank-requirements";
import { formatRwf } from "@/utils/financing";

const EXAMPLES = [15_000_000, 25_000_000, 28_000_000];

export default function Requirements() {
  return (
    <main className="bg-muted/30">
      <div className="container-page py-10 sm:py-12">
        <p className="text-eyebrow text-muted-foreground">Tunga Taxi</p>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
          What the bank needs from you
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Bring these to your instructor or upload them against your permanent candidate ID. Items
          marked as conditional only apply to some drivers.
        </p>

        <ol className="mt-8 space-y-3">
          {BANK_REQUIREMENTS.map((r, i) => (
            <li key={r.key}>
              <Card className="flex gap-4 border-border/70 p-5">
                <span className="font-display text-sm font-bold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-semibold">{r.label}</h2>
                    {r.conditional && <Badge variant="secondary">{r.conditional}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="mt-10 border-border/70 p-6">
          <h2 className="font-display text-lg font-semibold">Deposit tiers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            10% of the vehicle price up to 25M RWF, 15% from 26M RWF. If you cannot raise the cash,
            you may pledge collateral worth more than 30% of the vehicle value — or ask UZA Access
            to top up the gap.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {EXAMPLES.map((price) => {
              const req = depositRequirement(price);
              return (
                <div key={price} className="rounded-lg border border-border/70 bg-muted/50 p-4">
                  <p className="text-eyebrow text-muted-foreground">
                    {formatRwf(price, { compact: true })} vehicle
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">
                    {formatRwf(req.amount, { compact: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(req.percent * 100)}% deposit · or collateral above{" "}
                    {formatRwf(req.collateralAmount, { compact: true })}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="mt-6 border-border/70 p-6">
          <h2 className="font-display text-lg font-semibold">Possible obstacles</h2>
          <div className="mt-4 space-y-4">
            {OBSTACLES.map((o) => (
              <div key={o.title}>
                <h3 className="text-sm font-semibold">{o.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Other than these, nothing else should stand between you and this loan.
          </p>
        </Card>

        <Button asChild size="lg" className="mt-8">
          <Link to="/apply">Start your application</Link>
        </Button>
      </div>
    </main>
  );
}

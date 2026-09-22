import { AlertTriangle } from "lucide-react";

export const IncompletePricesBanner = () => (
  <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
    <p>Certains prix n'ont pas pu être récupérés. La valorisation affichée est partielle.</p>
  </div>
);
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePortfolio, useDeletePortfolio } from "../api/portfolio.api";
import { PortfolioFormSheet } from "./PortfolioFormSheet";

export function PortfolioMenu({ portfolioId }: { portfolioId: string }) {
  const [edit, setEdit] = useState(false);
  const { data } = usePortfolio(portfolioId);      // PortfolioDetailResponse → prérempli le form
  const del = useDeletePortfolio();
  const nav = useNavigate();

  const onDelete = () => {
    if (confirm('Supprimer ce portefeuille et toutes ses transactions ?'))
      del.mutate(portfolioId, { onSuccess: () => nav('/portfolios', { replace: true }) });
  };

  return (
    <>
      <button onClick={() => setEdit(true)} className="p-2" aria-label="Modifier"><Pencil size={18} /></button>
      <button onClick={onDelete} className="p-2 text-loss" aria-label="Supprimer"><Trash2 size={18} /></button>
      {data && <PortfolioFormSheet open={edit} onClose={() => setEdit(false)} initial={data} />}
    </>
  );
}
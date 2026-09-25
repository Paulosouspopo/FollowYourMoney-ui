import { FileUp, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { toast } from "@/shared/ui/toast.store";
import { usePortfolio, useDeletePortfolio } from "../api/portfolio.api";
import { PortfolioFormSheet } from "./PortfolioFormSheet";
import { undoAction } from "@/features/trash/api/trash.api";

export function PortfolioMenu({ portfolioId }: { portfolioId: string }) {
  const [edit, setEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data } = usePortfolio(portfolioId);      // PortfolioDetailResponse → prérempli le form
  const del = useDeletePortfolio();
  const nav = useNavigate();

  const onDelete = () => del.mutate(portfolioId, {
    onSuccess: r => { toast.success('Portefeuille supprimé', undoAction(r)); nav('/portfolios', { replace: true }); },
    onError: e => { setConfirmDelete(false); toast.error(e.message); },
  });

  return (
    <>
      <Link to={`/portfolios/${portfolioId}/import`} data-tour="import" className="p-2 text-muted-foreground hover:text-foreground" aria-label="Importer un relevé" title="Importer un relevé"><FileUp size={18} /></Link>
      <button onClick={() => setEdit(true)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Modifier"><Pencil size={18} /></button>
      <button onClick={() => setConfirmDelete(true)} className="p-2 text-loss" aria-label="Supprimer"><Trash2 size={18} /></button>
      {data && <PortfolioFormSheet open={edit} onClose={() => setEdit(false)} initial={data} />}
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete}
        title={`Supprimer « ${data?.name ?? 'ce portefeuille'} » ?`}
        description="Toutes ses transactions et son historique seront définitivement supprimés."
        onConfirm={onDelete} loading={del.isPending} />
    </>
  );
}

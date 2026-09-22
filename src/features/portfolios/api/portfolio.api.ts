import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { PortfolioResponse, PortfolioDetailResponse, PortfolioCreateRequest, PortfolioUpdateRequest } from '@/features/portfolios/model/portfolio.types';

export const portfolioKeys = {
  all: ['portfolios'] as const, detail: (id: string) => ['portfolios', id] as const
};

export const usePortfolios = () => useQuery({
  queryKey: portfolioKeys.all, queryFn: () => api.get<PortfolioResponse[]>('/portfolios').then(r => r.data)
});
export const usePortfolio = (id: string) => useQuery({
  queryKey: portfolioKeys.detail(id), queryFn: () => api.get<PortfolioDetailResponse>(`/portfolios/${id}`).then(r => r.data), enabled: !!id
});

const useInvalidatePortfolios = () => {
  const qc = useQueryClient(); return () => Promise.all([qc.invalidateQueries({ queryKey: portfolioKeys.all }), qc.invalidateQueries({ queryKey: dashboardKeys.all })]);
};

export const useCreatePortfolio = () => {
  const inv = useInvalidatePortfolios(); return useMutation({
    mutationFn: (b: PortfolioCreateRequest) => api.post<PortfolioResponse>('/portfolios', b).then(r => r.data), onSuccess: inv
  });
};
export const useUpdatePortfolio = (id: string) => {
  const inv = useInvalidatePortfolios(); return useMutation({
    mutationFn: (b: PortfolioUpdateRequest) => api.put<PortfolioResponse>(`/portfolios/${id}`, b).then(r => r.data), onSuccess: inv
  });
};
export const useDeletePortfolio = () => {
  const inv = useInvalidatePortfolios(); return useMutation({
    mutationFn: (id: string) => api.delete(`/portfolios/${id}`), onSuccess: inv
  });
};
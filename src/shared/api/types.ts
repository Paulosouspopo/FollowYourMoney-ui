export interface FieldError { field: string; message: string; }
export interface ApiError { timestamp: string; status: number; error?: string; message: string; fieldErrors?: FieldError[]; }
export const isApiError = (e: unknown): e is ApiError => typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
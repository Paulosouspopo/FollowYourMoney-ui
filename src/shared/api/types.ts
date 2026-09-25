export interface FieldError { field: string; message: string; }
export interface ApiError {
  timestamp: string; status: number; error?: string;
  /** Code métier stable renvoyé par le back (ex : EMAIL_NOT_VERIFIED, RATE_LIMITED). */
  code?: string;
  message: string; fieldErrors?: FieldError[];
}
export const isApiError = (e: unknown): e is ApiError => typeof e === 'object' && e !== null && 'status' in e && 'message' in e;

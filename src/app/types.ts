export interface FetchResponse<T> {
  ok: boolean;
  detail?: string;
  data: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  state: "STATE_ENABLED" | "STATE_DISABLED";
}

export interface AuthResponse {
  ok: boolean;
  detail: string | null;
  validation_errors: Array<{ field: string; detail: string }> | null;
}

export interface Request {
  id: string;
  date: string;
  email: string;
  status: "APPROVED" | "REJECTED" | "PENDING" | "TIMEOUT";
  is_viewed?: boolean;
}

export interface RequestsCollectionResponse {
  ok: boolean;
  detail?: string;
  page_id: number;
  page_size: number;
  requests: Request[];
}

export interface CreateRequestResponse {
  ok: boolean;
  detail?: string;
  request: Request;
}

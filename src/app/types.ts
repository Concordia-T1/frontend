export interface BaseResponse {
  ok: boolean;
  detail?: string;
  validation_errors?: Array<{ field: string; detail: string }> | null;
}

export interface SuccessResponse extends BaseResponse {
  ok: true;
  detail?: string | null;
  validation_errors?: null;
}

export interface ErrorResponse extends BaseResponse {
  ok: false;
  detail: string;
  validation_errors?: Array<{ field: string; detail: string }> | null;
}

export interface FetchResponse<T> {
  ok: boolean;
  status?: number;
  detail?: string;
  data: T;
  claims?: ClaimRecord[];
  total_pages?: number;
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
  status:
    | "STATUS_QUEUED"
    | "STATUS_WAITING"
    | "STATUS_CONSENT"
    | "STATUS_REFUSED"
    | "STATUS_TIMEOUT";
  is_viewed: boolean;
}

export interface ClaimRecord {
  id: number;
  owner_id: number;
  owner_email: string;
  candidate_email: string;
  candidate_last_name: string | null;
  candidate_first_name: string | null;
  candidate_middle_name: string | null;
  candidate_phone: string | null;
  template_id: number;
  status:
    | "STATUS_QUEUED"
    | "STATUS_WAITING"
    | "STATUS_CONSENT"
    | "STATUS_REFUSED"
    | "STATUS_TIMEOUT";
  responded_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string | null;
}

export interface RequestsCollectionResponse {
  ok: boolean;
  detail?: string;
  page_id: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  claims: ClaimRecord[];
}

export interface CreateRequestResponse {
  ok: boolean;
  detail?: string;
  claims: ClaimRecord[];
}

export interface TemplateRecord {
  id: number;
  owner_id: number;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
}

export interface TemplateResponse extends SuccessResponse {
  template: TemplateRecord;
}

export interface TemplatesCollectionResponse extends SuccessResponse {
  page_id: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  templates: TemplateRecord[];
}

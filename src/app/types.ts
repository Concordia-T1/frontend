export interface BaseResponse {
  ok: boolean;
  detail?: string | null;
  validation_errors?: Array<{ field: string; detail: string }> | null;
}

export interface SuccessResponse extends BaseResponse {
  ok: true;
  detail?: string | null;
  validation_errors?: null;
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
  is_viewed: boolean;
}

export interface RequestAdmin extends Request {
  sender: string;
}

export interface ClaimRecord {
  id: string;
  owner_id: string;
  owner_email: string;
  candidate_email: string;
  candidate_last_name: string | null;
  candidate_first_name: string | null;
  candidate_middle_name: string | null;
  candidate_phone: string | null;
  candidate_birthdate: string | null;
  template_id: string;
  status:
    | "STATUS_QUEUED"
    | "STATUS_WAITING"
    | "STATUS_CONSENT"
    | "STATUS_REFUSED"
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

export interface CreateRequestResponse extends BaseResponse {
  ok: boolean;
  detail?: string | null;
  validation_errors?: Array<{ field: string; detail: string }> | null;
  claims: ClaimRecord[];
}

export interface TemplateRecord {
  id: string;
  owner_id: string;
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

export interface Account {
  id: string;
  email: string;
  role: string;
  state: "STATE_ENABLED" | "STATE_DISABLED";
  created_date: string;
}

export interface AccountsCollectionResponse {
  ok: boolean;
  detail: string | null;
  validation_errors: Array<{ field: string; detail: string }> | null;
  page_id: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  accounts: Account[];
}

export interface UserMeResponse extends SuccessResponse {
  account: {
    id: string;
    email: string;
    role: string;
    state: "STATE_ENABLED" | "STATE_DISABLED";
    created_date: string;
  };
}

export interface ContactsRecord {
  user_id: string;
  email: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_api_key: string | null;
  smtp_tls: boolean;
  smtp_ssl: boolean;
  smtp_ssl_host: string | null;
  notification_types: string[];
  contact_telegram: string | null;
  contact_whatsapp: string | null;
}
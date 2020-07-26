import { HttpStatusCode } from "./http-status-code.ts";

export interface HttpError {
  status: HttpStatusCode;
  message?: string;
}

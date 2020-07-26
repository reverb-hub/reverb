export interface HttpRequest {
  method: string;
  uri: string;
  version: string | undefined;
  headers: Map<string, string>;
  body: string;
}

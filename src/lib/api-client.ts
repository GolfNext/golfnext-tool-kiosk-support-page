/**
 * Shared API client for calling GolfNext backend services.
 *
 * All requests to GolfNext APIs should go through this client
 * to ensure consistent headers, error handling, and auth.
 */

interface ApiClientOptions {
  baseUrl?: string;
  token?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "";
    this.token = options.token ?? null;
  }

  setToken(token: string): void {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        return { data: null, error: body.error ?? `HTTP ${response.status}` };
      }
      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { data: null, error: message };
    }
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const responseBody = (await response.json()) as { error?: string };
        return {
          data: null,
          error: responseBody.error ?? `HTTP ${response.status}`,
        };
      }
      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { data: null, error: message };
    }
  }
}

/** Default API client instance. Set the token after portal auth. */
export const apiClient = new ApiClient();

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "@/lib/api-client";

describe("ApiClient", () => {
  let client: ApiClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    client = new ApiClient({ baseUrl: "https://api.example.com" });
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get", () => {
    it("returns data on successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test Tool" }),
      });

      const result = await client.get<{ id: number; name: string }>("/tools/1");

      expect(result.data).toEqual({ id: 1, name: "Test Tool" });
      expect(result.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/tools/1",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("returns error on failed response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      });

      const result = await client.get("/tools/999");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Not found");
    });

    it("includes Authorization header when token is set", async () => {
      client.setToken("my-token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get("/tools");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-token",
          }),
        })
      );
    });

    it("handles network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const result = await client.get("/tools");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Network failure");
    });
  });

  describe("post", () => {
    it("sends body and returns data on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, name: "New Tool" }),
      });

      const result = await client.post<{ id: number; name: string }>(
        "/tools",
        { name: "New Tool" }
      );

      expect(result.data).toEqual({ id: 2, name: "New Tool" });
      expect(result.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/tools",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "New Tool" }),
        })
      );
    });
  });
});

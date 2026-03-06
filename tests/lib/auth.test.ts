import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractBearerToken } from "@/lib/auth";

describe("extractBearerToken", () => {
  it("extracts token from valid Authorization header", () => {
    const request = new Request("http://localhost:3000/api/test", {
      headers: { Authorization: "Bearer my-jwt-token" },
    });
    const token = extractBearerToken(request);
    expect(token).toBe("my-jwt-token");
  });

  it("returns null when Authorization header is missing", () => {
    const request = new Request("http://localhost:3000/api/test");
    const token = extractBearerToken(request);
    expect(token).toBeNull();
  });

  it("returns null when Authorization header is not Bearer", () => {
    const request = new Request("http://localhost:3000/api/test", {
      headers: { Authorization: "Basic some-credentials" },
    });
    const token = extractBearerToken(request);
    expect(token).toBeNull();
  });

  it("returns null for empty Bearer value", () => {
    const request = new Request("http://localhost:3000/api/test", {
      headers: { Authorization: "Bearer " },
    });
    const token = extractBearerToken(request);
    expect(token).toBeNull();
  });
});

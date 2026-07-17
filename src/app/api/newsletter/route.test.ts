import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// Mock the db module before importing the route
vi.mock("@/lib/db", () => ({
  db: {
    newsletterSubscriber: {
      upsert: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { POST } from "./route";
import { db } from "@/lib/db";

describe("POST /api/newsletter", () => {
  it("accepts a valid email", async () => {
    const res = await POST(
      new Request("http://localhost/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(db.newsletterSubscriber.upsert).toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(
      new Request("http://localhost/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

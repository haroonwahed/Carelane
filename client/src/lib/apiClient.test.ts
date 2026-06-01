import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";

describe("apiClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost:3000"),
      writable: true,
      configurable: true,
    });
    document.cookie = "csrftoken=test-token";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes FormData bodies through to fetch without JSON stringifying", async () => {
    const formData = new FormData();
    formData.append("title", "Casus 1");
    formData.append("assessment_summary", "Test");

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await apiClient.post("/care/api/cases/intake-create/", formData);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(formData);
    expect(init.headers).toEqual(expect.objectContaining({ "X-CSRFToken": "test-token" }));
    expect(init.headers).not.toEqual(expect.objectContaining({ "Content-Type": "application/json" }));
  });

  it("stringifies plain JSON bodies", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await apiClient.post("/care/api/cases/intake-create/", { title: "Casus 1" });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(JSON.stringify({ title: "Casus 1" }));
    expect(init.headers).toEqual(expect.objectContaining({ "Content-Type": "application/json" }));
  });
});

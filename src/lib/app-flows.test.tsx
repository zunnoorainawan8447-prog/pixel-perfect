// @vitest-environment jsdom
/**
 * Local live-regression: drives the real TanStack routes in jsdom —
 * practice, exam, settings languages/RTL, bookmarks, topics,
 * assistant error handling.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "../routeTree.gen";

// jsdom lacks scrollIntoView (real browsers have it)
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
  });
  await router.load();
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  return { router, user };
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("home", () => {
  it("renders hero subtitle and no Lovable branding", async () => {
    await renderAt("/");
    expect(document.title).toMatch(/CITIZEN/);
    expect(document.body.textContent).toMatch(/Independent study tool/);
    expect(document.body.textContent).not.toMatch(/lovable/i);
  });
});

describe("study topics", () => {
  it("lists 8 topics and renders substantial content with reading time", async () => {
    const { user } = await renderAt("/topics");
    const links = screen
      .getAllByRole("link")
      .filter((a) => (a as HTMLAnchorElement).href.includes("/topics/"));
    expect(links.length).toBeGreaterThanOrEqual(8);
    await user.click(links[0]!);
    await screen.findByText(/\bmin\b/i, {}, { timeout: 5000 }).catch(() => null);
    const body = document.body.textContent ?? "";
    expect(body.length).toBeGreaterThan(2000);
    expect(body).toMatch(/\bmin\b/i);
  });
});

describe("practice flow", () => {
  it("answers, shows verdict + explanation, toggles bookmark, filters update search", async () => {
    const { user, router } = await renderAt("/practice");
    // question prompt visible (stem may use "___" fill-in-the-blank style)
    const prompt = document.querySelector("h2");
    expect((prompt?.textContent ?? "").trim().length).toBeGreaterThan(20);

    // answer first option then check
    const options = document.querySelectorAll("div.space-y-2 > button");
    expect(options.length).toBe(4);
    await user.click(options[1]!);
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    const body = document.body.textContent ?? "";
    expect(body).toMatch(/correct|incorrect/i);

    // bookmark toggles to ★
    const bm = screen.getByRole("button", { name: /★|☆/ });
    expect(bm.textContent).toBe("☆");
    await user.click(bm);
    expect(bm.textContent).toBe("★");

    // topic filter
    const selects = document.querySelectorAll("select");
    await user.selectOptions(selects[0]!, "history");
    expect(router.state.location.search).toMatchObject({ topic: "history" });
    // difficulty filter
    await user.selectOptions(selects[1]!, "easy");
    expect(router.state.location.search).toMatchObject({ difficulty: "easy" });
  });
});

describe("mock exam flow", () => {
  it("runs 10 untimed questions and shows a % score", async () => {
    const { user } = await renderAt("/exam");
    const selects = document.querySelectorAll("select");
    await user.selectOptions(selects[0]!, "10");
    const timed = screen.getByRole("checkbox") as HTMLInputElement;
    if (timed.checked) await user.click(timed);
    await user.click(screen.getByRole("button", { name: /start exam/i }));

    for (let q = 0; q < 10; q++) {
      const opts = document.querySelectorAll("div.space-y-2 > button");
      expect(opts.length).toBe(4);
      await user.click(opts[0]!);
      const next = screen.queryByRole("button", { name: /→/ });
      if (next) await user.click(next);
      else break;
    }
    const finish = screen.queryByRole("button", { name: /finish exam/i });
    if (finish) await user.click(finish);
    const confirm = screen.queryByRole("button", { name: /^confirm$/i });
    if (confirm) await user.click(confirm);
    const body = document.body.textContent ?? "";
    expect(body).toMatch(/%/);
  }, 60000);
});

describe("bookmarks + progress", () => {
  it("bookmarked question appears on /bookmarks; /progress renders", async () => {
    const { user } = await renderAt("/practice");
    const options = document.querySelectorAll("div.space-y-2 > button");
    const promptText = document.querySelector("h2")?.textContent ?? "";
    await user.click(options[0]!);
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    await user.click(screen.getByRole("button", { name: /★|☆/ }));
    cleanup();

    await renderAt("/bookmarks");
    expect(document.body.textContent).toContain(promptText.slice(0, 40));
    cleanup();

    await renderAt("/progress");
    expect((document.body.textContent ?? "").length).toBeGreaterThan(300);
  });
});

describe("settings languages", () => {
  it("40 UI languages; French switches lang; Arabic sets RTL; back to English", async () => {
    const { user } = await renderAt("/settings");
    const uiPanel = document.querySelectorAll("div.mt-3.space-y-2")[0]!;
    const btns = within(uiPanel as HTMLElement).getAllByRole("button");
    expect(btns.length).toBe(40);

    await user.click(within(uiPanel as HTMLElement).getByRole("button", { name: /français/i }));
    expect(document.documentElement.lang).toBe("fr");

    await user.click(within(uiPanel as HTMLElement).getByRole("button", { name: /العربية/ }));
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");

    await user.click(within(uiPanel as HTMLElement).getByRole("button", { name: /english/i }));
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });
});

describe("assistant", () => {
  it("handles a failed AI call gracefully without hanging", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("no key")));
    const { user } = await renderAt("/assistant");
    await user.type(
      screen.getByRole("textbox", { name: "Your question" }),
      "What is on the citizenship test?",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));
    // graceful error state: user message shown, error bubble with the failure, and a "Try again" retry button
    const retry = await screen.findByRole("button", { name: /try again/i }, { timeout: 15000 });
    expect(retry).toBeTruthy();
    expect(document.body.textContent).toContain("What is on the citizenship test?");
    expect(document.body.textContent).toContain("no key");
  }, 30000);
});

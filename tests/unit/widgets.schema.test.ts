import { describe, it, expect } from "vitest";
import { createWidgetSchema } from "@/lib/validation/widgets";

describe("createWidgetSchema", () => {
  it("accepts a valid config", () => {
    const input = {
      widgetType: "booking" as const,
      filters: { category: "Yoga", location: "San Francisco" },
      theme: { mode: "dark" as const, primaryColor: "#2563eb", borderRadius: "medium" as const },
      settings: {
        showPricing: true,
        showAvailability: true,
        showReviews: false,
        maxBookings: 10
      }
    };
    const parsed = createWidgetSchema.parse(input);
    expect(parsed.widgetType).toBe("booking");
    expect(parsed.theme.mode).toBe("dark");
    expect(parsed.filters.category).toBe("Yoga");
  });

  it("rejects invalid theme color", () => {
    const bad = {
      widgetType: "calendar" as const,
      theme: { mode: "light" as const, primaryColor: "blue" }, // not a hex
    };
    expect(() => createWidgetSchema.parse(bad)).toThrow();
  });

  it("rejects invalid widget type", () => {
    const bad = {
      widgetType: "invalid" as any,
      theme: { mode: "light" as const },
    };
    expect(() => createWidgetSchema.parse(bad)).toThrow();
  });

  it("applies default values", () => {
    const minimal = {
      widgetType: "reviews" as const,
    };
    const parsed = createWidgetSchema.parse(minimal);
    expect(parsed.theme.mode).toBe("light");
    expect(parsed.theme.borderRadius).toBe("medium");
    expect(parsed.settings?.showPricing).toBe(true);
  });

  it("applies defaults when theme is provided but incomplete", () => {
    const partial = {
      widgetType: "social" as const,
      theme: { mode: "dark" as const },
    };
    const parsed = createWidgetSchema.parse(partial);
    expect(parsed.theme.mode).toBe("dark");
    expect(parsed.theme.borderRadius).toBe("medium"); // default applied
  });
});

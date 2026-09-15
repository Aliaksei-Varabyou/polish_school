import { describe, expect, it } from "vitest";
import { authErrorCode } from "../auth/errors.ts";
import { birthYears, needsParentalConsent, percent, safeNext } from "./account.ts";

const now = new Date("2026-09-15T12:00:00Z");

describe("needsParentalConsent", () => {
  it("is required while the student may be under 16", () => {
    expect(needsParentalConsent(2015, now)).toBe(true);
    expect(needsParentalConsent(2010, now)).toBe(true);
    expect(needsParentalConsent(2009, now)).toBe(false);
    expect(needsParentalConsent(null, now)).toBe(false);
  });
});

describe("birthYears", () => {
  it("lists years newest first within the API range", () => {
    const years = birthYears(now);
    expect(years[0]).toBe(2021);
    expect(years.at(-1)).toBe(1990);
  });
});

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/history/1?x=1")).toBe("/history/1?x=1");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext(null, "/")).toBe("/");
  });
});

describe("percent", () => {
  it("handles zero totals", () => {
    expect(percent(1, 3)).toBe(33);
    expect(percent(0, 0)).toBe(0);
  });
});

describe("authErrorCode", () => {
  it("maps Supabase errors", () => {
    expect(authErrorCode({ code: "invalid_credentials" })).toBe("invalid_credentials");
    expect(authErrorCode({ message: "User already registered" })).toBe("user_already_exists");
    expect(authErrorCode({ code: "weak_password" })).toBe("weak_password");
    expect(authErrorCode({ code: "otp_disabled" })).toBe("no_account");
    expect(authErrorCode({ code: "over_email_send_rate_limit" })).toBe("rate_limit");
    expect(authErrorCode(new Error("boom"))).toBe("generic");
  });
});

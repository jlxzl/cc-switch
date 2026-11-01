import { describe, expect, it } from "vitest";
import { compareVersions, toPublicVersion } from "@/lib/version";

describe("toPublicVersion", () => {
  it("把 ZL 内部后缀换成对外序号", () => {
    expect(toPublicVersion("4.0.23-z")).toBe("4.0.23");
    expect(toPublicVersion("4.0.23-z.1")).toBe("4.0.23.1");
  });

  it("其他版本原样返回", () => {
    expect(toPublicVersion("4.0.23")).toBe("4.0.23");
    expect(toPublicVersion("4.0.23-beta.1")).toBe("4.0.23-beta.1");
    expect(toPublicVersion("")).toBe("");
  });
});

describe("四段对外版本比较", () => {
  it("把第四段纳入排序", () => {
    expect(compareVersions("4.0.23", "4.0.23.1")).toBeLessThan(0);
    expect(compareVersions("4.0.23.1", "4.0.23.2")).toBeLessThan(0);
    expect(compareVersions("4.0.23.2", "4.0.23.2")).toBe(0);
    expect(compareVersions("4.0.23.2", "4.0.23-z.2")).toBeGreaterThan(0);
  });
});

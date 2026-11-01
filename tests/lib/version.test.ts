import { describe, expect, it } from "vitest";
import { toPublicVersion } from "@/lib/version";

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

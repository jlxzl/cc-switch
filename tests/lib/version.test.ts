import { describe, expect, it } from "vitest";
import {
  compareVersions,
  toOfficialBaseVersion,
  toPublicVersion,
} from "@/lib/version";

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

describe("toOfficialBaseVersion", () => {
  it("把 ZL 的 patch 编码还原成官方基线版本", () => {
    expect(toOfficialBaseVersion("4.0.2701")).toBe("4.0.27");
    expect(toOfficialBaseVersion("4.0.2501")).toBe("4.0.25");
    expect(toOfficialBaseVersion("4.0.2803")).toBe("4.0.28");
  });

  it("上游原样版本与旧四段版本按原 patch 处理", () => {
    expect(toOfficialBaseVersion("4.0.28")).toBe("4.0.28");
    expect(toOfficialBaseVersion("4.0.23.1")).toBe("4.0.23");
    expect(toOfficialBaseVersion("4.0.23-z.1")).toBe("4.0.23");
  });

  it("无法解析时原样返回", () => {
    expect(toOfficialBaseVersion("")).toBe("");
    expect(toOfficialBaseVersion("unknown")).toBe("unknown");
  });

  it("官方已发布 4.0.28 时，ZL 4.0.2701 应判定为落后", () => {
    expect(
      compareVersions("4.0.28", toOfficialBaseVersion("4.0.2701")),
    ).toBeGreaterThan(0);
    // 同一官方基线的 ZL 构建不误报
    expect(
      compareVersions("4.0.28", toOfficialBaseVersion("4.0.2801")),
    ).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { validateIconFile } from "./iconFile";

describe("validateIconFile", () => {
  it("accepts supported image formats under the size limit", () => {
    expect(validateIconFile(new File(["png"], "icon.png", { type: "image/png" }))).toBeNull();
    expect(validateIconFile(new File(["jpg"], "icon.jpg", { type: "image/jpeg" }))).toBeNull();
    expect(validateIconFile(new File(["webp"], "icon.webp", { type: "image/webp" }))).toBeNull();
  });

  it("rejects unsupported formats and oversized icons", () => {
    expect(validateIconFile(new File(["svg"], "icon.svg", { type: "image/svg+xml" }))).toBe(
      "图标仅支持 PNG、JPG、WebP 格式",
    );
    expect(
      validateIconFile(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "icon.png", { type: "image/png" }),
      ),
    ).toBe("图标文件超过 2MB");
  });
});

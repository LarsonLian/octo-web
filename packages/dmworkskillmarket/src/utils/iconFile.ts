import { t } from "@octo/base";

export const SKILL_ICON_ACCEPT = "image/png,image/jpeg,image/webp";
export const MAX_SKILL_ICON_SIZE = 2 * 1024 * 1024;

const ALLOWED_ICON_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function validateIconFile(file: File): string | null {
  if (!ALLOWED_ICON_TYPES.has(file.type)) {
    return t("skillMarket.upload.iconInvalidFormat");
  }
  if (file.size > MAX_SKILL_ICON_SIZE) {
    return t("skillMarket.upload.iconFileTooLarge");
  }
  return null;
}

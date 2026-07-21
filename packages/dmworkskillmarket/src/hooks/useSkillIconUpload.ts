import type React from "react";
import { useRef } from "react";
import { validateIconFile } from "../utils/iconFile";

interface UseSkillIconUploadOptions {
  onError: (message: string | null) => void;
  onCropFile: (file: File) => void;
}

export function useSkillIconUpload({
  onError,
  onCropFile,
}: UseSkillIconUploadOptions) {
  const iconInputRef = useRef<HTMLInputElement | null>(null);

  function handleIconClick() {
    iconInputRef.current?.click();
  }

  function handleIconInputClick(event: React.MouseEvent<HTMLInputElement>) {
    event.currentTarget.value = "";
  }

  function handleIconFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const validationError = validateIconFile(file);
    onError(validationError);
    if (validationError) return;
    onCropFile(file);
  }

  return {
    iconInputRef,
    handleIconClick,
    handleIconInputClick,
    handleIconFileChange,
  };
}

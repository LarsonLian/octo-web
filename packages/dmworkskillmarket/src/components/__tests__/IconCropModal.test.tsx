import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IconCropModal from "../IconCropModal";

vi.mock("react-avatar-editor", async () => {
  const React = await import("react");
  const AvatarEditor = React.forwardRef((props: { scale: number }, ref: React.ForwardedRef<{ getImageScaledToCanvas: () => HTMLCanvasElement }>) => {
    React.useImperativeHandle(ref, () => ({
      getImageScaledToCanvas: () => document.createElement("canvas"),
    }));
    return React.createElement("canvas", {
      "data-testid": "avatar-editor",
      "data-scale": String(props.scale),
    });
  });
  AvatarEditor.displayName = "AvatarEditorMock";
  return { default: AvatarEditor };
});

describe("IconCropModal", () => {
  it("resets zoom scale when switching files", () => {
    const first = new File(["one"], "one.png", { type: "image/png" });
    const second = new File(["two"], "two.png", { type: "image/png" });
    const { rerender } = render(
      <IconCropModal visible file={first} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "2.4" } });
    expect(screen.getByTestId("avatar-editor")).toHaveAttribute("data-scale", "2.4");

    rerender(<IconCropModal visible file={second} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByTestId("avatar-editor")).toHaveAttribute("data-scale", "1.2");
  });
});

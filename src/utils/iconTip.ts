type IconTipEdge = "above" | "below" | "left" | "right";

/** Immediate hover name for icon-only controls. */
export function iconTip(label: string, edge: IconTipEdge = "above") {
  return {
    "aria-label": label,
    "data-icon-tip": label,
    ...(edge === "above" ? {} : { "data-icon-tip-edge": edge }),
  };
}

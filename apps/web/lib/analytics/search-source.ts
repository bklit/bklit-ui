let pendingSearchOpenSource: "click" | "keyboard" = "keyboard";

export function markSearchOpenedFromClick() {
  pendingSearchOpenSource = "click";
}

export function consumeSearchOpenSource() {
  const source = pendingSearchOpenSource;
  pendingSearchOpenSource = "keyboard";
  return source;
}

export function getOpenPanelClientId() {
  return process.env.OPENPANEL_CLIENT_ID ?? process.env.CLIENT_ID ?? "";
}

export function getOpenPanelClientSecret() {
  return process.env.OPENPANEL_CLIENT_SECRET ?? process.env.CLIENT_SECRET ?? "";
}

export function isOpenPanelConfigured() {
  return getOpenPanelClientId().length > 0;
}

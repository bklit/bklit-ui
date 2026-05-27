import "server-only";

import { OpenPanel } from "@openpanel/nextjs";

import {
  getOpenPanelClientId,
  getOpenPanelClientSecret,
  isOpenPanelConfigured,
} from "./openpanel-env";

export const opServer = isOpenPanelConfigured()
  ? new OpenPanel({
      clientId: getOpenPanelClientId(),
      clientSecret: getOpenPanelClientSecret(),
    })
  : null;

import type { AppConfig } from "./lib/types";

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: "Waldo The Wellness Warrior",
  pageTitle: "Health Wellness Voice Agent",
  pageDescription:
    "A voice agent to help reduce the backlog in the healthcare industry.",

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: "/lk-logo.svg",
  accent: "#002cf2",
  logoDark: "/lk-logo-dark.svg",
  accentDark: "#1fd5f9",
  startButtonText: "Start call",
};

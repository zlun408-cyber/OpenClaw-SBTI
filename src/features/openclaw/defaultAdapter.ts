import { createWebchatAdapter } from "./WebchatAdapter";

export const defaultOpenClawAdapter = createWebchatAdapter({
  baseUrl: import.meta.env.VITE_OPENCLAW_BASE_URL ?? "http://127.0.0.1:18789",
  session: import.meta.env.VITE_OPENCLAW_SESSION ?? "main"
});

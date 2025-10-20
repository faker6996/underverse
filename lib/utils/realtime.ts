import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import type { EmitEventRequest, EmitEventResponse } from "@/realtime/types";

export async function emitEvent(event: string, room: string | null, payload: any): Promise<EmitEventResponse | void> {
  const url = process.env.WS_GATEWAY_URL || (process.env.WS_PORT ? `http://localhost:${process.env.WS_PORT}/emit` : "");
  if (!url) return;

  const apiKey = process.env.WS_API_KEY || "";
  const requestBody: EmitEventRequest = { event, room: room || undefined, payload };

  try {
    const response = await fetch(url, {
      method: HTTP_METHOD_ENUM.POST,
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json() as EmitEventResponse;
  } catch (e) {
    console.warn("emitEvent failed:", (e as any)?.message);
    return { ok: false, error: (e as any)?.message || "Unknown error" };
  }
}

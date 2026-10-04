import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const deviceId = z.string().regex(/^[a-zA-Z0-9-]{16,64}$/);

// Demo persistence keyed by an anonymous device id. Stores only demo preferences (no personal data).
export const loadDemoProfile = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ deviceId }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("demo_profiles").select("data").eq("device_id", data.deviceId).maybeSingle();
    return { json: row?.data ? JSON.stringify(row.data) : null };
  });

export const saveDemoProfile = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ deviceId, data: z.record(z.string(), z.unknown()) }).parse(d))
  .handler(async ({ data }) => {
    if (JSON.stringify(data.data).length > 20000) throw new Error("Profile too large");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("demo_profiles")
      .upsert({ device_id: data.deviceId, data: data.data as never, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

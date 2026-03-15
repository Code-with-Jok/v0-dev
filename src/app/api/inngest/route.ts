import { processMessage } from "@/features/conversations/inngest/process-message";
import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { demoError, demoGenerated } from "../../../inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [demoGenerated, demoError, processMessage],
});

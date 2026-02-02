import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({
    name: "demo/generated",
    data: {},
  });
  return Response.json({
    status: "started",
  });
}

// import { google } from "@ai-sdk/google";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
const MODEL_AI = process.env.MODEL_AI;

export async function POST() {
  if (!MODEL_AI) {
    throw new Error("MODEL_AI is not defined");
  }

  const response = await generateText({
    model: google(MODEL_AI),
    prompt: "Hello, how are you?",
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  });

  return new Response(response.text);
}

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(32),
    // ... other env variables
  },
  client: {
    // ... client env variables
  },
  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    // ... other env variables
  },
}); 
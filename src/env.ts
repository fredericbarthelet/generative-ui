import "dotenv/config";

import { z } from "zod";

export const env = z
  .object({
    OPENAI_API_KEY: z.string().min(1),
  })
  .parse(process.env);

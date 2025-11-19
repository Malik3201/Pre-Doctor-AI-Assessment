import { z } from 'zod';

export const healthCheckSchema = z.object({
  symptomInput: z.string().min(5, 'Please describe your symptoms in more detail.'),
  qaFlow: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .optional(),
});


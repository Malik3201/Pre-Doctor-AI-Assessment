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
    .max(3, 'A maximum of 3 follow-up entries is allowed.')
    .optional(),
  age: z.number().int().min(0).max(120).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export const checkupChatSchema = z.object({
  symptomInput: z.string().min(5, 'Please describe your symptoms in more detail.'),
  qaFlow: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
    )
    .max(3, 'A maximum of 3 follow-up entries is allowed.')
    .optional(),
});


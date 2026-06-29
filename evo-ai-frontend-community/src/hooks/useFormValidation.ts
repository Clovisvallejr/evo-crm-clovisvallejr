import { useCallback } from 'react';
import { ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Hook para validar dados contra um schema Zod
 * Retorna erros de validação em formato amigável
 */
export function useFormValidation() {
  const validate = useCallback(
    async (data: any, schema: ZodSchema): Promise<ValidationError[]> => {
      try {
        await schema.parseAsync(data);
        return [];
      } catch (error: any) {
        if (error.errors) {
          return error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          }));
        }
        return [{ field: 'general', message: 'Erro ao validar formulário' }];
      }
    },
    []
  );

  return { validate };
}

/**
 * Hook para validar um campo específico
 */
export function useFieldValidation() {
  const validateField = useCallback(
    async (value: any, schema: ZodSchema): Promise<string | null> => {
      try {
        await schema.parseAsync(value);
        return null;
      } catch (error: any) {
        if (error.errors && error.errors.length > 0) {
          return error.errors[0].message;
        }
        return 'Valor inválido';
      }
    },
    []
  );

  return { validateField };
}

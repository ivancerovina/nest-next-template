import { builtInFields } from "@common/plugin-sdk/shared";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
} from "@common/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
} from "react-hook-form";
import z from "zod";
import { login } from "../lib";

const FormSchema = z.object({
  identifier: z.email().or(builtInFields.username),
  password: z.string(),
});

function SubmitButton() {
  const { isSubmitting } = useFormState();

  return (
    <Button type="submit" className="w-full mt-6">
      {isSubmitting ? <Spinner className="size-6" /> : "Log in"}
    </Button>
  );
}

export function LoginForm() {
  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const handleSubmit = useCallback(async (data: z.infer<typeof FormSchema>) => {
    const result = await login(data);
    console.info(result);
  }, []);

  return (
    <Card className={cn("w-full max-w-md")}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Controller
              name="identifier"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    E-mail or Username
                  </FieldLabel>
                  <Input
                    type="text"
                    placeholder="mail@example.com"
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    type="password"
                    placeholder="********"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <SubmitButton />
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

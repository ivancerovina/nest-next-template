import { builtInFields } from "@common/plugin-sdk/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@common/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { createFirstEmployee } from "../lib";

const FormSchema = z.object({
  first_name: z.string().min(2, "Too short").max(100),
  last_name: z.string().min(2, "Too short").max(100),
  username: builtInFields.username,
  email: z.email().optional(),
  password: builtInFields.password,
});

type FormValues = z.infer<typeof FormSchema>;

interface CreateFirstUserFormProps {
  onSuccess?: () => void;
}

export function CreateFirstUserForm({ onSuccess }: CreateFirstUserFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    },
    resolver: zodResolver(FormSchema),
  });

  const handleSubmit = useCallback(
    async (data: FormValues) => {
      const result = await createFirstEmployee(data);
      if (result) {
        onSuccess?.();
      }
    },
    [onSuccess],
  );

  return (
    <Card className={cn("w-full max-w-md")}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create Admin Account</CardTitle>
        <CardDescription>
          Set up your first administrator account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="first_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                    <Input
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
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
                name="last_name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                    <Input
                      type="text"
                      placeholder="Doe"
                      autoComplete="family-name"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    type="text"
                    placeholder="johndoe"
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                  <Input
                    type="email"
                    placeholder="mail@example.com"
                    autoComplete="email"
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
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button type="submit" className="w-full mt-6">
              Create Account
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

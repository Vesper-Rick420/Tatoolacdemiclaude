"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteSettings } from "@/lib/actions/site-content";
import {
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/validations/site-content";

const textareaClass =
  "flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function SiteSettingsForm({
  mision,
  vision,
}: {
  mision: string;
  vision: string;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: { mision, vision },
  });

  function onSubmit(values: SiteSettingsInput) {
    startTransition(async () => {
      const result = await updateSiteSettings(values);
      if (result.error) toast.error(result.error);
      else toast.success(result.success ?? "Guardado.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Misión y Visión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="mision">Misión</Label>
            <textarea
              id="mision"
              rows={4}
              {...register("mision")}
              className={textareaClass}
            />
            {errors.mision && (
              <p className="text-sm text-destructive">
                {errors.mision.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Visión</Label>
            <textarea
              id="vision"
              rows={4}
              {...register("vision")}
              className={textareaClass}
            />
            {errors.vision && (
              <p className="text-sm text-destructive">
                {errors.vision.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

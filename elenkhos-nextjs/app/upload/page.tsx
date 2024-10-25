"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useStateAction } from "next-safe-action/stateful-hooks";
import { analyseDebate } from "../actions/analyse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const schema = z
  .object({
    audioFile: z.any(),
    assemblyKey: z.string().min(1, "Assembly AI key is required"),
    openaiKey: z.string().min(1, "OpenAI key is required"),
  })
  .superRefine((data, ctx) => {
    if (typeof window !== "undefined") {
      const { audioFile } = data;
      if (!(audioFile instanceof FileList) || audioFile.length === 0) {
        ctx.addIssue({
          path: ["audioFile"],
          code: z.ZodIssueCode.custom,
          message: "Audio file is required",
        });
      } else if (audioFile[0].size > MAX_FILE_SIZE) {
        ctx.addIssue({
          path: ["audioFile"],
          code: z.ZodIssueCode.custom,
          message: "Audio file must be less than 10 MB",
        });
      }
    }
  });

type FormData = z.infer<typeof schema>;

export default function UploadPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { execute, result, status, isPending } = useStateAction(analyseDebate);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append("audioFile", data.audioFile[0]);
    formData.append("assemblyKey", data.assemblyKey);
    formData.append("openaiKey", data.openaiKey);

    execute(formData);
  };

  useEffect(() => {
    if (status === "hasSucceeded" && result.data) {
      setMessage(`Debate created with ID: ${result.data.debateId}`);
    } else if (status === "hasErrored") {
      setMessage(
        `An error occurred: ${result.serverError} ${result.validationErrors}`
      );
    }
  }, [status, result.data, result.serverError, result.validationErrors]);

  return (
    <div className="flex">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
          <FormField
            control={form.control}
            name="audioFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        // Add size validation here
                        if (e.target.files[0]?.size > MAX_FILE_SIZE) {
                          form.setError("audioFile", {
                            message: "Audio file must be less than 10 MB",
                          });
                        } else {
                          form.clearErrors("audioFile");
                          field.onChange(e.target.files);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assemblyKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assembly AI Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your Assembly AI key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="openaiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenAI Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your OpenAI key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
      {message && (
        <div className="mt-4 p-4 bg-green-100 rounded">{message}</div>
      )}
    </div>
  );
}

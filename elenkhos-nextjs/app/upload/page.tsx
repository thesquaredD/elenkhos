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

const schema = z.object({
  audioFile: z.any().refine((value) => {
    if (typeof window === "undefined") return true;
    return value instanceof FileList && value.length > 0;
  }, "Audio file is required"),
  assemblyKey: z.string().min(1, "Assembly AI key is required"),
  openaiKey: z.string().min(1, "OpenAI key is required"),
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-8 rounded shadow-md"
        >
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
                        field.onChange(e.target.files);
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

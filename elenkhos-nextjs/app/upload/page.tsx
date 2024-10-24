"use client";
import React from "react";
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

const schema = z.object({
  audioFile: z
    .instanceof(FileList, { message: "Audio file is required" })
    .refine((files) => files.length > 0, "Audio file is required"),
  assemblyKey: z.string().min(1, "Assembly AI key is required"),
  openaiKey: z.string().min(1, "OpenAI key is required"),
});

type FormData = z.infer<typeof schema>;

export default function UploadPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle form submission
    const audioFile = data.audioFile[0];
    const assemblyKey = data.assemblyKey;
    const openaiKey = data.openaiKey;

    // Implement your upload logic here
    console.log({ audioFile, assemblyKey, openaiKey });
  };

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
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

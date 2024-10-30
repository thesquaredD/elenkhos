"use client";

import {
  DrizzleArgument,
  DrizzlePremise,
  DrizzleCriticalQuestion,
} from "@/drizzle/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface ArgumentDetailsProps {
  argument: DrizzleArgument;
}

function formatTimestamp(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function ArgumentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-1" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-32 mb-1" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%]" />
        </div>
      </div>
    </div>
  );
}

export default function ArgumentDetails({ argument }: ArgumentDetailsProps) {
  const [premises, setPremises] = useState<DrizzlePremise[]>([]);
  const [criticalQuestions, setCriticalQuestions] = useState<
    DrizzleCriticalQuestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchArgumentDetails() {
      try {
        setIsLoading(true);
        setHasError(false);

        const [premisesResponse, questionsResponse] = await Promise.all([
          fetch(`/api/arguments/${argument.id}/premises`),
          fetch(`/api/arguments/${argument.id}/critical-questions`),
        ]);

        if (!premisesResponse.ok || !questionsResponse.ok) {
          throw new Error("Failed to fetch argument details");
        }

        const [premisesData, questionsData] = await Promise.all([
          premisesResponse.json(),
          questionsResponse.json(),
        ]);

        setPremises(premisesData);
        setCriticalQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching argument details:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArgumentDetails();
  }, [argument.id]);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-green-100 border border-green-500 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
            Selected
          </span>
          <CardTitle className="text-xl">
            {argument.shortName || "Unnamed Argument"}
          </CardTitle>
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {argument.scheme}
        </span>
        <div className="flex items-center gap-2">
          <CardDescription>
            By {argument.speaker || "Unknown Speaker"}
          </CardDescription>
          {argument.start != null && argument.end != null && (
            <>
              <CardDescription>•</CardDescription>
              <CardDescription className="text-sm text-muted-foreground/80">
                {formatTimestamp(argument.start)} -{" "}
                {formatTimestamp(argument.end)}
              </CardDescription>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ArgumentSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            <section>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Conclusion
              </span>
              <p className="text-sm">
                {argument.conclusion || "No conclusion provided"}
              </p>
            </section>
            {/* Main Content */}
            <div className="space-y-6">
              {premises.length > 0 && (
                <section>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Key Premises
                  </span>
                  <ul className="list-disc pl-4 space-y-2">
                    {premises.map((premise) => (
                      <li key={premise.id} className="text-sm">
                        {premise.text}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {criticalQuestions.length > 0 && (
                <section className="bg-primary/5 flex flex-col gap-2 rounded-lg p-4 border border-primary/10">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Critical Questions
                  </span>
                  <ul className="list-none space-y-3">
                    {criticalQuestions.map((question, index) => (
                      <li key={question.id} className="flex gap-3 text-sm">
                        <span className="text-primary font-medium">
                          Q{index + 1}.
                        </span>
                        <span>{question.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Full Argument
                </span>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">
                    {argument.text || "No text available"}
                  </p>
                </div>
              </section>
            </div>

            {hasError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                Failed to load argument details. Please try again later.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

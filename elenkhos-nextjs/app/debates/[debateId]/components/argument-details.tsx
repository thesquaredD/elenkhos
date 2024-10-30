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
    <Card>
      <CardHeader>
        <CardTitle>{argument.shortName || "Unnamed Argument"}</CardTitle>
        <CardDescription>
          By {argument.speaker || "Unknown Speaker"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ArgumentSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            {argument.scheme && (
              <div>
                <h3 className="font-semibold mb-1">Argumentation Scheme</h3>
                <p className="text-sm text-muted-foreground">
                  {argument.scheme}
                </p>
              </div>
            )}

            {premises.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Premises</h3>
                <ul className="list-disc pl-4">
                  {premises.map((premise) => (
                    <li
                      key={premise.id}
                      className="text-sm text-muted-foreground"
                    >
                      {premise.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-1">Conclusion</h3>
              <p className="text-sm text-muted-foreground">
                {argument.conclusion || "No conclusion provided"}
              </p>
            </div>

            {criticalQuestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Critical Questions</h3>
                <ul className="list-disc pl-4">
                  {criticalQuestions.map((question) => (
                    <li
                      key={question.id}
                      className="text-sm text-muted-foreground"
                    >
                      {question.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-1">Full Text</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {argument.text || "No text available"}
              </p>
            </div>

            {argument.start != null && argument.end != null && (
              <div>
                <h3 className="font-semibold mb-1">Timestamp</h3>
                <p className="text-sm text-muted-foreground">
                  {`${formatTimestamp(argument.start)} - ${formatTimestamp(
                    argument.end
                  )}`}
                </p>
              </div>
            )}

            {hasError && (
              <div className="text-sm text-destructive">
                Failed to load argument details. Please try again later.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

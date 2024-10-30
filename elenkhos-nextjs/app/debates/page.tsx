import { db } from "@/drizzle/db";
import { debates } from "@/drizzle/schema";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DebatesPage() {
  const allDebates = await db.select().from(debates);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex justify-between space-x-2">
        <h1 className="text-4xl font-bold">Debates</h1>
        <Link href="/upload">
          <Button>Upload New Debate</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {allDebates.map((debate) => (
          <Link
            key={debate.id}
            href={`/debates/${debate.id}`}
            className="block"
          >
            <div className="border rounded-lg p-4 hover:border-primary transition-colors">
              <h2 className="text-xl font-semibold mb-1">{debate.title}</h2>
              {debate.description && (
                <p className="text-muted-foreground text-sm">
                  {debate.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Created: {debate.dateCreated?.toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}

        {allDebates.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No debates found. Upload your first debate to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

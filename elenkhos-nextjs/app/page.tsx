// Start of Selection
import {
  FileText,
  PieChart,
  Link2,
  LayoutDashboard,
  GitGraphIcon,
  Clock,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Transcription and Diarization",
      description:
        "Converts audio files into text with speaker labels using AssemblyAI.",
      icon: FileText,
    },
    {
      title: "Argument Segmentation",
      description:
        "Processes transcripts to merge related segments into coherent arguments.",
      icon: Link2,
    },
    {
      title: "Argument Analysis",
      description:
        "Utilizes Walton&apos;s framework to identify argumentation schemes, premises, conclusions, and critical questions.",
      icon: LayoutDashboard,
    },
    {
      title: "Relation Analysis",
      description:
        "Determines support and attack relationships between arguments to understand their interactions.",
      icon: PieChart,
    },
    {
      title: "Graph Visualization",
      description:
        "Generates a directed graph representing the structure and relationships of arguments.",
      icon: GitGraphIcon,
    },
    {
      title: "Chronological Display",
      description:
        "Displays the arguments in a chronological order to understand the flow of the debate.",
      icon: Clock,
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-5xl font-bold mb-4 text-center">
        Welcome to Elenkhos
      </h1>
      <p className="text-lg text-center mb-8 max-w-2xl">
        Elenkhos is a comprehensive tool designed to transcribe, diarize, and
        analyze debate audio files. It leverages advanced machine learning
        models to segment, analyze, and visualize arguments within a debate,
        providing insights into the structure and relationships of the arguments
        presented.
      </p>
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-semibold mb-6 text-center">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card rounded-lg shadow-md p-6 flex flex-col  text-left"
            >
              <feature.icon className="w-8 h-8 text-primary/90 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm  text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8"></div>
    </div>
  );
}

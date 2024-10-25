export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
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
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>
            <strong>Transcription and Diarization:</strong> Converts audio files
            into text with speaker labels using AssemblyAI.
          </li>
          <li>
            <strong>Argument Segmentation:</strong> Processes transcripts to
            merge related segments into coherent arguments.
          </li>
          <li>
            <strong>Argument Analysis:</strong> Utilizes Walton&apos;s framework
            to identify argumentation schemes, premises, conclusions, and
            critical questions.
          </li>
          <li>
            <strong>Relation Analysis:</strong> Determines support and attack
            relationships between arguments to understand their interactions.
          </li>
          <li>
            <strong>Graph Visualization:</strong> Generates a directed graph
            representing the structure and relationships of arguments.
          </li>
        </ul>
      </div>
      <div className="mt-8"></div>
    </div>
  );
}

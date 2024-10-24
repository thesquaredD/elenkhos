import "server-only";
import { AssemblyAI, Transcript } from "assemblyai";

export async function transcribeAndDiarize(
  audioBuffer: ArrayBuffer,
  assemblyAIKey: string
): Promise<Transcript> {
  const client = new AssemblyAI({ apiKey: assemblyAIKey });

  const transcript = await client.transcripts.transcribe({
    audio: Buffer.from(audioBuffer),
    speaker_labels: true,
  });

  if (transcript.status === "error") {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  return transcript;
}

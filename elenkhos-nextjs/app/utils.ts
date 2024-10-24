import { Transcript } from "assemblyai";
import { MergedSegment } from "./types";

export function segmentTranscript(transcript: Transcript): MergedSegment[] {
  const segments: MergedSegment[] = [];
  let currentSegment: MergedSegment | null = null;

  for (const utterance of transcript.utterances ?? []) {
    if (!currentSegment || currentSegment.speaker !== utterance.speaker) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = { text: utterance.text, speaker: utterance.speaker };
    } else {
      currentSegment.text += " " + utterance.text;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

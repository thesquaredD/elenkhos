import os
import logging
import assemblyai as aai  # type: ignore
import requests
import json
import hashlib
from typing import Dict, Any, List
import networkx as nx  # type: ignore
from pydantic import BaseModel
from openai import OpenAI
import argparse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

client = OpenAI()


def get_file_hash(file_path: str) -> str:
    """Calculate a hash of the file content and properties."""
    hasher = hashlib.md5()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    file_stats = os.stat(file_path)
    hasher.update(str(file_stats.st_size).encode('utf-8'))
    hasher.update(str(file_stats.st_mtime).encode('utf-8'))
    return hasher.hexdigest()


class MergedSegment(BaseModel):
    text: str
    speaker: str


class Step(BaseModel):
    explanation: str
    output: str


class MergedSegmentsResponse(BaseModel):
    steps: list[Step]
    final_answer: List[MergedSegment]


class Relation(BaseModel):
    source: int
    target: int
    type: str


class RelationsResponse(BaseModel):
    relations: List[Relation]


class ArgumentAnalysis(BaseModel):
    scheme: str
    premises: List[str]
    conclusion: str
    critical_questions: List[str]


def save_transcription(file_hash: str, transcript: Dict[str, Any]) -> None:
    """Save the transcription to a JSON file."""
    cache_dir = os.path.join(os.path.dirname(__file__), 'transcription_cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"{file_hash}.json")
    with open(cache_file, 'w') as f:
        json.dump(transcript, f)


def load_transcription(file_hash: str) -> Dict[str, Any] | None:
    """Load the transcription from a JSON file if it exists."""
    cache_dir = os.path.join(os.path.dirname(__file__), 'transcription_cache')
    cache_file = os.path.join(cache_dir, f"{file_hash}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    return None


def save_analysis(file_hash: str, analysis: Dict[str, Any]) -> None:
    """Save the analysis to a JSON file."""
    cache_dir = os.path.join(os.path.dirname(__file__), 'analysis_cache')
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"{file_hash}.json")
    with open(cache_file, 'w') as f:
        json.dump(analysis, f)


def load_analysis(file_hash: str) -> Dict[str, Any] | None:
    """Load the analysis from a JSON file if it exists."""
    cache_dir = os.path.join(os.path.dirname(__file__), 'analysis_cache')
    cache_file = os.path.join(cache_dir, f"{file_hash}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    return None


def utterance_to_dict(utterance: aai.Utterance) -> Dict[str, Any]:
    return {
        'text': utterance.text,
        'start': utterance.start,
        'end': utterance.end,
        'confidence': utterance.confidence,
        'speaker': utterance.speaker,
        'words': [word_to_dict(word) for word in utterance.words]
    }


def word_to_dict(word: aai.UtteranceWord) -> Dict[str, Any]:
    return {
        'text': word.text,
        'start': word.start,
        'end': word.end,
        'confidence': word.confidence,
        'speaker': word.speaker
    }


def transcribe_and_diarize(audio_path: str) -> Dict[str, Any]:
    try:
        # Set up AssemblyAI API key
        aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")
        
        if not aai.settings.api_key:
            raise ValueError("AssemblyAI API key not found in environment variables")

        logger.info(f"Starting transcription and diarization for {audio_path}")
        
        # Calculate file hash
        file_hash = get_file_hash(audio_path)
        
        # Check if transcription exists in cache
        cached_transcript = load_transcription(file_hash)
        if cached_transcript:
            logger.info("Using cached transcription")
            return cached_transcript

        # Create a transcriber instance
        transcriber = aai.Transcriber()
        
        # Configure transcription options
        config = aai.TranscriptionConfig(
            speaker_labels=True,  # Enable speaker diarization
        )
        
        # Transcribe the audio file
        logger.info("Starting transcription...")
        transcript = transcriber.transcribe(audio_path, config=config)

        logger.info(f"Transcription status: {transcript.status}")
        if transcript.status == aai.TranscriptStatus.error:
            logger.error(f"Transcription error: {transcript.error}")
            raise aai.TranscriptError(f"Transcription failed: {transcript.error}")

        logger.info("Transcription and diarization completed")

        # Save the transcription to cache
        transcript_dict = {
            'id': transcript.id,
            'text': transcript.text,
            'utterances': [utterance_to_dict(u) for u in transcript.utterances],
            'words': [word_to_dict(w) for w in transcript.words],
            'confidence': transcript.confidence,
            'audio_duration': transcript.audio_duration,
            'status': transcript.status.value,
            'error': transcript.error,
            'summary': transcript.summary,
            'chapters': transcript.chapters,
            'entities': transcript.entities,
            'sentiment_analysis': transcript.sentiment_analysis,
            'iab_categories': transcript.iab_categories,
            'content_safety': transcript.content_safety,
            'auto_highlights': transcript.auto_highlights
        }
        
        save_transcription(file_hash, transcript_dict)

        return transcript_dict

    except requests.exceptions.Timeout:
        logger.error("Timeout error occurred during API request")
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error occurred: {str(e)}")
        raise
    except aai.AssemblyAIError as e:
        logger.error(f"AssemblyAI API error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        raise


class Argument(BaseModel):
    id: int
    text: str
    speaker: str
    scheme: str
    premises: List[str]
    conclusion: str
    critical_questions: List[str]


class DebateAnalyzer:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.arguments: List[Argument] = []

    def analyze_transcript(self, transcript: Dict[str, Any], file_hash: str):
        # Check if analysis exists in cache
        cached_analysis = load_analysis(file_hash)
        if cached_analysis:
            logger.info("Using cached analysis")
            self.arguments = [Argument(**arg) for arg in cached_analysis['arguments']]
            self.graph = nx.node_link_graph(cached_analysis['graph'])
            return

        segments = self.segment_transcript(transcript)
        for i, segment in enumerate(segments):
            analysis = self.analyze_argument(segment)
            
            arg = Argument(
                id=i,
                text=segment.text,
                speaker=segment.speaker,
                scheme=analysis.scheme,
                premises=analysis.premises,
                conclusion=analysis.conclusion,
                critical_questions=analysis.critical_questions
            )
            
            self.arguments.append(arg)
            # Store the dictionary representation instead of the Argument object
            self.graph.add_node(i, argument=arg.dict())
        
        self.analyze_relations()
        self.save_analysis(file_hash)

    def save_analysis(self, file_hash: str) -> None:
        """Save the analysis to a JSON file."""
        analysis_data = {
            'arguments': [arg.dict() for arg in self.arguments],
            'graph': nx.node_link_data(self.graph)
        }
        save_analysis(file_hash, analysis_data)

    def segment_transcript(self, transcript: Dict[str, Any]) -> List['MergedSegment']:
        segments = []
        current_segment = MergedSegment(text="", speaker="")
        
        for utterance in transcript['utterances']:
            if utterance['speaker'] != current_segment.speaker:
                if current_segment.text:
                    segments.append(current_segment)
                current_segment = MergedSegment(text=utterance['text'], speaker=utterance['speaker'])
            else:
                current_segment.text += " " + utterance['text']
        
        if current_segment.text:
            segments.append(current_segment)
        
        return self.merge_related_segments(segments)

    def merge_related_segments(self, segments: List['MergedSegment']) -> List['MergedSegment']:
        prompt = f"""
        Analyze the following segments from a debate transcript. **Exclude any interjections** and ensure that **only segments from the same speaker are merged** into a given argument.

        {json.dumps([segment.dict() for segment in segments], indent=2)}

        Identify which segments belong to the same argument and should be merged. **Only merge segments that have the same 'speaker'.**

        Return a list of merged arguments, where each argument is represented as a dictionary with 'text' and 'speaker' keys.
        """
        
        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": "You are a debate analysis assistant specializing in argument segmentation."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format=MergedSegmentsResponse,
            )
            
            merged_segments_response = completion.choices[0].message
            
            if merged_segments_response.refusal:
                logger.error(f"Model refused to respond: {merged_segments_response.refusal}")
                return segments
            else:
                if merged_segments_response.parsed is None:
                    raise ValueError("No parsed segments found in the response")
                return merged_segments_response.parsed.final_answer
        except Exception as e:
            logger.error(f"Error during merging segments: {str(e)}")
            return segments

    def analyze_argument(self, segment: 'MergedSegment') -> ArgumentAnalysis:
        prompt = f"""
        Analyze the following argument from a debate:
        Speaker: {segment.speaker}
        Text: "{segment.text}"
        
        Provide the following information in JSON format:
        1. The argumentation scheme according to Walton's framework
        2. The premises of the argument
        3. The conclusion of the argument
        4. Critical questions relevant to this argument scheme
        """
        
        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": "You are a debate analysis assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format=ArgumentAnalysis,
            )
            if completion.choices[0].message.parsed is None:
                raise ValueError("No parsed argument analysis found in the response")
            return completion.choices[0].message.parsed
        except Exception as e:
            logger.error(f"Error during argument analysis: {str(e)}")
            raise

    def analyze_relations(self):
        prompt = f"""
        Analyze the relationships between the following arguments in a debate:
        
        {json.dumps([arg.dict() for arg in self.arguments], indent=2)}
        
        For each pair of arguments, determine if there is a support or attack relationship or if they are unrelated.
        """
        
        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": "You are a debate analysis assistant."},
                    {"role": "user", "content": prompt}
                ],
                response_format=RelationsResponse,
            )
            relations = completion.choices[0].message.parsed.relations
            
            for relation in relations:
                self.graph.add_edge(relation.source, relation.target, type=relation.type)
        except Exception as e:
            logger.error(f"Error during relations analysis: {str(e)}")
            raise

    def output_graph(self) -> Dict:
        return nx.node_link_data(self.graph)


def main(audio_path: str) -> None:
    try:
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Calculate file hash
        file_hash = get_file_hash(audio_path)

        # Transcribe and diarize the audio
        transcript = transcribe_and_diarize(audio_path)

        # Initialize the DebateAnalyzer
        analyzer = DebateAnalyzer()

        # Analyze the transcript
        analyzer.analyze_transcript(transcript, file_hash)

        # Output basic transcript information
        print("Transcript Summary:")
        print(f"Total duration: {transcript['audio_duration']} seconds")
        print(f"Number of speakers: {len(set(u['speaker'] for u in transcript['utterances']))}")
        print("---")

        # Output the analyzed arguments
        print("Analyzed Arguments:")
        for arg in analyzer.arguments:
            print(f"Speaker {arg.speaker}:")
            print(f"Argument: {arg.text}")
            print(f"Scheme: {arg.scheme}")
            print(f"Premises: {', '.join(arg.premises)}")
            print(f"Conclusion: {arg.conclusion}")
            print("Critical Questions:")
            for question in arg.critical_questions:
                print(f"- {question}")
            print("---")

        # Output the argument graph
        graph_data = analyzer.output_graph()

        # (Optional) Verification Step
        # Ensure all 'argument' fields are dictionaries
        for node in graph_data['nodes']:
            if isinstance(node.get('argument'), dict):
                continue
            else:
                node['argument'] = node['argument'].dict()

        print("Argument Relations:")
        for edge in graph_data['links']:
            source = analyzer.arguments[edge['source']]
            target = analyzer.arguments[edge['target']]
            print(f"Argument {edge['source']} ({source.speaker}) {edge['type']}s Argument {edge['target']} ({target.speaker})")

        # Serialize to JSON
        with open('debate_analysis.json', 'w') as f:
            json.dump({
                'arguments': [arg.dict() for arg in analyzer.arguments],
                'graph': graph_data
            }, f, indent=2)

        print("\nAnalysis complete. Results saved to debate_analysis.json")

    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"An error occurred in main: {str(e)}")
        raise
    
if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser(description="Process an audio file for debate analysis.")
        parser.add_argument('audio_file', type=str, help='Path to the audio file to analyze.')
        args = parser.parse_args()
        
        audio_file = args.audio_file
        logger.info(f"Starting analysis process for {audio_file}")
        main(audio_file)
    except Exception as e:
        logger.critical(f"Critical error in main execution: {str(e)}")
        exit(1)

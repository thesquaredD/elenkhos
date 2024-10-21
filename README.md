# Elenkhos

Elenkhos is a comprehensive tool designed to transcribe, diarize, and analyze debate audio files. It leverages advanced machine learning models to segment, analyze, and visualize arguments within a debate, providing insights into the structure and relationships of the arguments presented.

## Features

- **Transcription and Diarization**: Converts audio files into text with speaker labels using AssemblyAI.
- **Argument Segmentation**: Processes transcripts to merge related segments into coherent arguments.
- **Argument Analysis**: Utilizes Walton's framework to identify argumentation schemes, premises, conclusions, and critical questions.
- **Relation Analysis**: Determines support and attack relationships between arguments to understand their interactions.
- **Graph Visualization**: Generates a directed graph representing the structure and relationships of arguments.

## Files

### transcribe.py

This script handles the transcription, diarization, and analysis of audio files using the AssemblyAI and OpenAI APIs. It includes functions and classes to:

- Calculate file hashes for caching transcriptions and analyses.
- Save and load transcriptions and analyses from cache directories (`transcription_cache/` and `analysis_cache/`).
- Convert AssemblyAI's utterances and words into dictionary formats.
- Transcribe and diarize audio files, ensuring efficient processing with caching.
- Segment the transcript into merged arguments based on speaker consistency.
- Analyze each argument to identify its scheme, premises, conclusion, and critical questions.
- Analyze relationships between arguments to identify support or attack connections.
- Output the argument structure as a JSON file (`debate_analysis.json`).

### debate_analysis.json

This JSON file contains the results of the debate analysis, including:

- **Arguments**: A list of arguments with their text, speaker, argumentation scheme, premises, conclusion, and critical questions.
- **Graph**: A directed graph representing the relationships between arguments, suitable for visualization.

## Usage

1. **Set up the environment**:
   - Ensure you have Python installed.
   - Install the required packages using `pip install -r requirements.txt`.
   - Set the `ASSEMBLYAI_API_KEY` and `OPENAI_API_KEY` environment variables with your AssemblyAI and OpenAI API keys, respectively.

2. **Run the transcription and analysis**:
   - Place your audio file in the same directory as `transcribe.py`.
   - Run the script: `python transcribe.py your_audio_file.wav`.

3. **View the results**:
   - The results will be saved in `debate_analysis.json`.
   - You can view the analyzed arguments and their relationships in the console output or by opening the JSON file.

## Example

To analyze a debate audio file named `debate.wav`, follow these steps:

1. Ensure the `ASSEMBLYAI_API_KEY` and `OPENAI_API_KEY` are set in your environment.
2. Run the script:

   ```sh
   python transcribe.py debate.wav
   ```

3. The script will output the transcription, analyzed arguments, and their relationships. The results will be saved in `debate_analysis.json`.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

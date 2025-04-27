# Elenkhos

## Overview

Elenkhos is a comprehensive tool designed to transcribe, diarize, analyze, and visualize arguments within debate audio or video files. By leveraging advanced machine learning models and argumentation theory, Elenkhos aims to transform unstructured debate content into a structured argument tree, enabling deeper understanding and engagement with complex discussions, particularly in the political sphere.

## Ambition & Vision

The primary ambition of Elenkhos is to provide an accessible platform for anyone to upload a debate (audio or video) and receive a detailed analysis of its argumentative structure. We envision Elenkhos empowering users to:

* Objectively understand the core arguments presented by different sides.
* Identify the relationships (support/attack) between arguments.
* Evaluate the logical structure using established frameworks (like Walton's argumentation schemes).
* Navigate complex political discourse more effectively.
* Foster more informed and structured discussions about debated topics.

## Key Features

* **Transcription and Diarization:** Converts audio files into text with speaker labels (utilizing AssemblyAI).
* **Argument Segmentation:** Processes transcripts to identify and merge related segments into coherent arguments.
* **Argument Analysis:** Applies Walton's argumentation schemes framework to identify premises, conclusions, and critical questions within arguments.
* **Relation Analysis:** Determines support and attack relationships between identified arguments.
* **Graph Visualization:** Generates an interactive directed graph representing the structure and relationships of arguments.
* **Chronological Display:** Presents arguments in their original sequence to understand the flow of the debate.
* **File Upload:** Supports uploading of debate audio/video files for analysis.

## Technologies (Frontend - elenkhos-nextjs)

* **Framework:** Next.js
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **Transcription/Diarization:** AssemblyAI (via API call)

## Technologies (Backend - elenkhos-backend)

* **Framework:** FastAPI
* **Language:** Python
* **Database:** Supabase

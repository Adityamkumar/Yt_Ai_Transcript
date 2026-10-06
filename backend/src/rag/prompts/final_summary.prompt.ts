export const FINAL_SUMMARY_SYSTEM_PROMPT = `

You are given summaries from consecutive sections of the same video.

Each section contains:

- Start Seconds
- End Seconds
- Summary

The Start Seconds and End Seconds values come from the original timestamped
transcript and are authoritative source metadata.

Your task is to create a final structured summary while preserving the
timestamp information for every section.

For each input section:

- Generate a short, clear, descriptive title based ONLY on that section's summary.
- The title must describe the main topic covered within that timestamp range.
- Do not invent a topic that is not supported by the section summary.
- Preserve the section's original summary meaning.
- Preserve the exact Start Seconds and End Seconds provided for that section.

IMPORTANT TIMESTAMP RULES:

- Treat Start Seconds and End Seconds as authoritative.
- Copy the provided timestamp values exactly into the output.
- Never invent timestamps.
- Never estimate timestamps.
- Never change, shift, round, or reconstruct timestamps.
- Never merge timestamp ranges.
- Never omit timestamp information.
- Never claim that timestamps are unavailable when Start Seconds and End Seconds
  are provided in the input.

SECTION PRESERVATION RULES:

- Preserve chronological order.
- Every input section MUST produce exactly one output item.
- Do NOT remove, omit, merge, combine, or collapse sections.
- Sections may contain overlapping or related concepts; keep them as separate
  sections because each section represents its own timestamp range.
- Remove only unnecessary repetition in the generated summary text when doing
  so does not change the meaning of that individual section.
- Keep important technical concepts and meaningful details.

TITLE RULES:

- Generate one short descriptive title for every section.
- Base the title only on the corresponding section's Summary.
- Do not use information from another section when creating the title.
- Avoid generic titles such as "Introduction", "Overview", or "Summary"
  unless the section content genuinely supports that title.
- If two consecutive sections discuss related but different concepts, give each
  section a title that clearly distinguishes its specific topic.

LANGUAGE:

- Respond entirely in the requested language.
- Keep technical terms accurate when they are commonly used in their original
  form.

OUTPUT FORMAT:

Return ONLY valid JSON.

For every input section, return exactly one object using this structure:

{
  "text": "Title: Summary",
  "timestamp": <start_seconds>,
  "endTimestamp": <end_seconds>
}

Requirements:

- "text" MUST contain the generated title followed by ": " and then the
  corresponding section summary.
- "timestamp" MUST contain the exact Start Seconds value from that section.
- "endTimestamp" MUST contain the exact End Seconds value from that section.
- Do not generate or modify timestamp values.
- Do not add extra fields.
- Do not omit required fields.
- Do not wrap the JSON in markdown.
- Do not explain anything.
- Do not write any text before or after the JSON.

Before returning the final JSON, verify that:

1. Every input section is represented exactly once.
2. The output remains in chronological order.
3. Every output timestamp exactly matches its corresponding Start Seconds.
4. Every output endTimestamp exactly matches its corresponding End Seconds.
5. Every section has a descriptive title generated from its own summary.
6. No sections or timestamp ranges were merged or omitted.
7. The output is valid JSON.

Return ONLY the JSON object.
`;

export const LONG_CONTEXT_SUMMARY_SYSTEM_PROMPT = `
You are an expert AI assistant generating a structured summary of an entire video transcript.

The transcript is provided as a sequence of numbered transcript chunks.

Each chunk contains:
- Chunk Index
- Start Seconds
- End Seconds
- Transcript Text

Your task is to identify the most important topics and concepts covered across the entire video.

SUMMARY RULES:
- Generate 8-12 meaningful highlights for a medium or long video.
- Cover the beginning, middle, and end of the video.
- Keep highlights in chronological order.
- Focus on important concepts, explanations, demonstrations, decisions, and conclusions.
- Do not create highlights for trivial remarks, greetings, repetition, or filler.
- Each highlight must represent a meaningful CONTIGUOUS section of the transcript.
- A highlight may span multiple consecutive transcript chunks.
- Do not combine unrelated or non-contiguous transcript regions.

SOURCE RANGE RULES:
- For every highlight, select the exact source transcript chunk range that supports it.
- "startChunkIndex" must be the first chunk belonging to the highlight.
- "endChunkIndex" must be the last chunk belonging to the highlight.
- Both indices are inclusive.
- Use ONLY chunk indices that actually exist in the supplied transcript.
- Never invent chunk indices.
- Never return timestamps.
- Do not calculate or estimate seconds yourself.
- Do not return start/end seconds in the response.

CONTENT RULES:
- Write a short descriptive topic title followed by ": " and a concise explanation.
- The explanation must be grounded only in the transcript chunks selected for that highlight.
- Preserve important technical details.
- Do not hallucinate information that is not present in the transcript.

OUTPUT RULE:
Return ONLY valid JSON.

Expected format:
{
  "summary": [
    {
      "text": "Topic: concise explanation",
      "startChunkIndex": 12,
      "endChunkIndex": 18
    }
  ]
}

Before returning:
1. Every highlight has a valid startChunkIndex.
2. Every highlight has a valid endChunkIndex.
3. startChunkIndex <= endChunkIndex.
4. Every range refers to existing transcript chunks.
5. Ranges are chronological.
6. Highlights cover the important parts of the video.
7. Return only valid JSON.
`;
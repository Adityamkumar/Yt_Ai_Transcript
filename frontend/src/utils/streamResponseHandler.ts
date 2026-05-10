interface StreamResponseHandlerOptions {
  response: Response;
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}

export async function streamResponseHandler({
  response,
  onChunk,
  signal,
}: StreamResponseHandlerOptions): Promise<string> {
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming is not supported by this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException('Request aborted', 'AbortError');
    }

    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;

    fullText += chunk;
    onChunk(chunk);
  }

  const remaining = decoder.decode();
  if (remaining) {
    fullText += remaining;
    onChunk(remaining);
  }

  return fullText;
}

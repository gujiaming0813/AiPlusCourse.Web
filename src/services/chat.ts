interface StreamChatParams {
  message: string;
  sessionId?: string | null;
  userLevel?: number;
  onChunk: (chunk: string) => void; // 正文回调
  onThought?: (thought: string) => void; // 🆕 思考过程回调
  onDone?: () => void;
  onError?: (error: unknown) => void;
  onSessionIdReceived?: (sessionId: string) => void;
}

export const streamChat = async ({
  message,
  sessionId,
  userLevel,
  onChunk,
  onThought,
  onDone,
  onError,
  onSessionIdReceived,
}: StreamChatParams) => {
  try {
    // 使用 fetch 原生 API 以便处理流
    const response = await fetch('/api/Chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 如果有鉴权 Token，请在这里添加
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Message: message,
        SessionId: sessionId,
        Level: userLevel || 1, // 默认为 Level 1
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理 Session ID
    const newSessionId = response.headers.get('X-Session-Id');
    if (newSessionId && onSessionIdReceived) {
      onSessionIdReceived(newSessionId);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) throw new Error('Response body is null');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 1. 解码并追加到缓冲区
      buffer += decoder.decode(value, { stream: true });

      // 2. 按换行符分割 (后端是用 \n 分隔每个 JSON 对象的)
      const lines = buffer.split('\n');

      // 3. 最后一个片段可能是不完整的，留给下一次循环处理
      buffer = lines.pop() || '';

      // 4. 处理每一行完整的 JSON
      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          // 根据类型分发
          if (data.type === 'thought' && onThought) {
            onThought(data.content);
          } else if (data.type === 'text' && onChunk) {
            onChunk(data.content);
          } else if (data.type === 'error') {
            console.error('API Error:', data.content);
            if (onError) onError(new Error(data.content));
          }
        } catch (e) {
          console.warn(`JSON parse error: ${e}, skipping line:`, line);
        }
      }
    }

    if (onDone) onDone();
  } catch (error) {
    console.error('Stream request failed:', error);
    if (onError) onError(error);
  }
};

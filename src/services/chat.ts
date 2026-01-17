// 这里我们直接导出一个基于 fetch 的流式请求函数
export const streamChat = async (
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: unknown) => void,
) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/chat/stream', {
      // 假设后端流式接口
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.body) throw new Error('ReadableStream not supported.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // 解码二进制流为文本
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
    onDone();
  } catch (error) {
    onError(error);
  }
};

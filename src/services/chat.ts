// 👇 定义一个新的参数接口，包含 sessionId 和回调
interface StreamChatParams {
  message: string;
  sessionId: string | null; // 由组件传入
  userLevel: number; // 由组件传入
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: unknown) => void;
  onSessionIdReceived?: (id: string) => void; // 新增：回传 SessionId 给组件
}

export const streamChat = async ({
  message,
  sessionId,
  userLevel,
  onChunk,
  onDone,
  onError,
  onSessionIdReceived,
}: StreamChatParams) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // 直接使用传入的参数
      body: JSON.stringify({
        message,
        sessionId: sessionId, // 如果是 null，后端会开新会话
        Level: userLevel,
      }),
    });

    // 👇 核心：从 Header 提取 SessionId 并通过回调传给组件
    const newSessionId = response.headers.get('X-Session-Id');
    if (newSessionId && onSessionIdReceived) {
      // 只有当 ID 真的变了或者是新的，才通知组件
      if (newSessionId !== sessionId) {
        console.log('Capture New SessionId:', newSessionId);
        onSessionIdReceived(newSessionId);
      }
    }

    if (!response.body) throw new Error('ReadableStream not supported.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
    onDone();
  } catch (error) {
    onError(error);
  }
};

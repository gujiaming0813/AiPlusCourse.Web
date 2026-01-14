import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Card, Spin } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, StopOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

// const { Text } = Typography;

// --- Types ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

// --- Clay Styles ---

const chatContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  // No background here, let it be transparent
};

const messageBubbleStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
  backgroundColor: role === 'user' ? '#7C5CFF' : '#ffffff',
  color: role === 'user' ? '#fff' : '#2D3436',
  borderRadius: role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  border: 'none',
  boxShadow:
    role === 'user' ? '8px 8px 16px rgba(124, 92, 255, 0.3)' : '8px 8px 16px rgba(0,0,0,0.05)',
});

const inputContainerStyle: React.CSSProperties = {
  flexShrink: 0,
  padding: '24px 0', // Padding handled by parent layout usually, but we add some vertical breathing room
  zIndex: 10,
};

const inputWrapperStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '24px',
  padding: '8px 8px 8px 24px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', // Floating shadow
  transition: 'all 0.3s',
};

const ChatArea: React.FC = () => {
  // --- State & Refs (Logic Preserved) ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 AI 学习伙伴。关于学习的任何问题都可以问我！',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamInterval = useRef<number | null>(null);

  // --- Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateStreamResponse = (userQuestion: string) => {
    setIsStreaming(true);
    const newAiMsgId = Date.now().toString() + '-ai';

    setMessages((prev) => [
      ...prev,
      {
        id: newAiMsgId,
        role: 'assistant',
        content: '',
        loading: true,
      },
    ]);

    // Mock response content (Chinese)
    let mockResponse = `收到你的问题：**"${userQuestion}"**。\n\nGemini 的流式响应是基于 **Server-Sent Events (SSE)** 或 **WebSocket** 实现的。\n\n在 React 中，我们通常会：\n1. 发起 Fetch 请求。\n2. 读取 response.body.getReader()\n3. 在循环中解码数据块。\n\n这是一个模拟的打字机效果...`;
    mockResponse = mockResponse + mockResponse; // Make it longer

    let currentIndex = 0;

    streamInterval.current = window.setInterval(() => {
      if (currentIndex >= mockResponse.length) {
        if (streamInterval.current) clearInterval(streamInterval.current);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === newAiMsgId ? { ...msg, loading: false } : msg)),
        );
        return;
      }

      const char = mockResponse[currentIndex];
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === newAiMsgId) {
            return {
              ...msg,
              content: msg.content + char,
              loading: false,
            };
          }
          return msg;
        }),
      );
      currentIndex++;
    }, 20); // Faster typing speed
  };

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    simulateStreamResponse(inputValue);
  };

  const handleStop = () => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
      setIsStreaming(false);
    }
  };

  return (
    <div style={chatContainerStyle}>
      {/* --- Header/Title (Optional, can be removed if redundant with Sider) --- */}
      {/* Kept minimal to focus on chat */}

      {/* --- Message List Area --- */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '16px', // Avoid scrollbar overlapping content
          minHeight: 0,
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {messages.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                marginBottom: 32,
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <Avatar
                size={48}
                style={{
                  backgroundColor: item.role === 'user' ? '#7C5CFF' : '#fff',
                  color: item.role === 'user' ? '#fff' : '#54A0FF',
                  flexShrink: 0,
                  boxShadow: '4px 4px 12px rgba(0,0,0,0.1)',
                  border: item.role === 'assistant' ? '1px solid #fff' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                icon={
                  item.role === 'user' ? (
                    <UserOutlined />
                  ) : (
                    <RobotOutlined style={{ fontSize: 24 }} />
                  )
                }
              />

              {/* Message Content */}
              <div style={{ maxWidth: '75%' }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#B2BEC3',
                    marginBottom: 6,
                    textAlign: item.role === 'user' ? 'right' : 'left', // Fixed: '右' -> 'right', '左' -> 'left'
                    alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                    padding: '0 4px',
                  }}
                >
                  {item.role === 'user' ? '你' : 'AI 导师'}
                </div>

                <Card
                  size="small"
                  style={messageBubbleStyle(item.role)}
                  // Increased padding to prevent text from sticking to the edge
                  styles={{ body: { padding: '20px 28px' } }}
                >
                  {item.loading && !item.content ? (
                    <Spin size="small" />
                  ) : (
                    <div
                      className="markdown-body"
                      style={{
                        lineHeight: 1.6,
                        fontSize: '15px',
                        color: item.role === 'user' ? '#fff' : '#2D3436',
                        // Ensure markdown content respects container padding
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.role === 'assistant' ? (
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      ) : (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{item.content}</span>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- Input Area --- */}
      <div style={inputContainerStyle}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={inputWrapperStyle}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入你的问题..."
              autoSize={{ minRows: 1, maxRows: 6 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              bordered={false}
              style={{
                padding: 0,
                resize: 'none',
                flex: 1,
                background: 'transparent',
                fontSize: 16,
                lineHeight: 1.5,
                color: '#2D3436',
              }}
              disabled={isStreaming}
            />

            <div style={{ marginLeft: 16 }}>
              {isStreaming ? (
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  size="large"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                  style={{
                    boxShadow: '4px 4px 12px rgba(255, 77, 79, 0.3)',
                    height: 48,
                    width: 48,
                  }}
                />
              ) : (
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<SendOutlined />}
                  disabled={!inputValue.trim()}
                  onClick={handleSend}
                  style={{
                    backgroundColor: inputValue.trim() ? '#7C5CFF' : '#E0E0E0',
                    border: 'none',
                    boxShadow: inputValue.trim() ? '4px 4px 12px rgba(124, 92, 255, 0.4)' : 'none',
                    transition: 'all 0.3s',
                    height: 48,
                    width: 48,
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#B2BEC3', marginTop: 12 }}>
            AI 可能会犯错，请核实重要信息。
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatArea;

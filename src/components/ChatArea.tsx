import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, Card, Spin } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, StopOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown'; // 用于渲染 Markdown

// 定义消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean; // 是否正在思考中
}

const ChatArea: React.FC = () => {
  // 初始消息数据
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 AI 助手，有什么可以帮你的吗？',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // 引用滚动到底部的 div
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 用来存储打字机定时器的引用，以便随时停止
  const streamInterval = useRef<number | null>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // 只要消息变动，就触发滚动

  // 模拟流式生成 (核心逻辑)
  // 模拟流式生成 (核心逻辑)
  const simulateStreamResponse = (userQuestion: string) => {
    setIsStreaming(true);

    // 1. 🟢 关键：先定义 ID 变量，只生成一次！
    const newAiMsgId = Date.now().toString() + '-ai';

    // 2. 添加初始空消息
    setMessages((prev) => [
      ...prev,
      {
        id: newAiMsgId, // 🟢 第一次使用变量
        role: 'assistant',
        content: '',
        loading: true,
      },
    ]);

    let mockResponse = `收到你的问题：**"${userQuestion}"**。\n\nGemini 的流式响应原理其实是基于 **Server-Sent Events (SSE)** 或者 **WebSocket**。\n\n在 React 中，我们通常这样做：\n1. 发起 Fetch 请求。\n2. 读取 \`response.body.getReader()\`。\n3. 循环解码数据块。\n\n这是一个模拟的打字机效果...`;
    mockResponse = mockResponse + mockResponse + mockResponse;

    let currentIndex = 0;

    streamInterval.current = window.setInterval(() => {
      if (currentIndex >= mockResponse.length) {
        if (streamInterval.current) clearInterval(streamInterval.current);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((msg) =>
            // 🟢 第二次使用变量：必须完全一致才能找到消息
            msg.id === newAiMsgId ? { ...msg, loading: false } : msg,
          ),
        );
        return;
      }

      const char = mockResponse[currentIndex];
      setMessages((prev) =>
        prev.map((msg) => {
          // 🟢 第三次使用变量
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
    }, 30);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming) return;

    // 1. 添加用户消息
    const userMsg: Message = {
      // 🔴 修改前: id: Date.now().toString(),
      // 🟢 修改后: 加上 '-user' 后缀，确保唯一
      id: Date.now().toString() + '-user',
      role: 'user',
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // 2. 触发 AI 响应
    simulateStreamResponse(inputValue);
  };

  // 停止生成
  const handleStop = () => {
    if (streamInterval.current) {
      clearInterval(streamInterval.current);
      setIsStreaming(false);
    }
  };

  return (
    // 最外层容器：高度必须是 100% 以铺满父组件 ChatPage
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        position: 'relative',
      }}
    >
      {/* --- 上半部分：消息列表区域 --- */}
      {/* flex: 1 确保它占据除输入框外的所有剩余空间 */}
      {/* overflowY: 'auto' 确保只有这部分会出现滚动条 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 0 20px', // 底部留白交给输入框区域的 padding
          minHeight: 0, // 防止 Flex 子项溢出 bug
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {' '}
          {/* 限制内容最大宽度，阅读体验更好 */}
          {messages.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                marginBottom: 24,
                gap: 16,
              }}
            >
              {/* 头像 */}
              <Avatar
                style={{
                  backgroundColor: item.role === 'user' ? '#1890ff' : '#00b96b',
                  flexShrink: 0,
                }}
                icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              />

              {/* 消息内容 */}
              <div style={{ maxWidth: '80%' }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#999',
                    marginBottom: 4,
                    textAlign: item.role === 'user' ? 'right' : 'left',
                  }}
                >
                  {item.role === 'user' ? '你' : 'AI'}
                </div>

                <Card
                  size="small"
                  style={{
                    backgroundColor: item.role === 'user' ? '#e6f7ff' : '#f6f6f6',
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: 'none',
                  }}
                  styles={{ body: { padding: '16px 24px' } }}
                >
                  {item.loading && !item.content ? (
                    <Spin size="small" />
                  ) : (
                    <div className="markdown-body" style={{ lineHeight: 1.6 }}>
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
          {/* 这是一个看不见的元素，用于自动定位到底部 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- 下半部分：固定在底部的输入框 --- */}
      {/* flexShrink: 0 保证它不会被压缩 */}
      <div
        style={{
          flexShrink: 0,
          padding: '30px 20px 20px 20px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* 输入框外壳：Flex 布局，模拟成一个整体 */}
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              boxShadow: isStreaming ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all 0.3s',
            }}
          >
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入您的问题..."
              autoSize={{ minRows: 1, maxRows: 6 }} // 自动增高，最大 6 行
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
                textAlign: 'left',
              }}
              disabled={isStreaming}
            />

            {/* 按钮区域 */}
            <div style={{ marginLeft: 8 }}>
              {isStreaming ? (
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                />
              ) : (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  disabled={!inputValue.trim()}
                  onClick={handleSend}
                  style={{
                    backgroundColor: inputValue.trim() ? '#00b96b' : undefined,
                  }}
                />
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#ccc', marginTop: 12 }}>
            生成式AI可能会显示不准确的信息，请核实重要信息。
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatArea;

import React, { useState, useRef, useEffect, type ComponentPropsWithoutRef } from 'react';
import { Input, Button, Avatar, Card, Spin, message, Tooltip } from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  StopOutlined,
  CopyOutlined,
  CheckOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { streamChat } from '@/services/chat';

// --- 类型定义 ---
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

type CodeComponentProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  node?: object;
};

type ImgComponentProps = ComponentPropsWithoutRef<'img'> & {
  node?: object;
};

// --- 样式定义 ---
const chatContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
};

const messageBubbleStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
  backgroundColor: role === 'user' ? '#7C5CFF' : '#ffffff',
  color: role === 'user' ? '#fff' : '#2D3436',
  borderRadius: role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  border: 'none',
  boxShadow:
    role === 'user' ? '8px 8px 16px rgba(124, 92, 255, 0.3)' : '8px 8px 16px rgba(0,0,0,0.05)',
  position: 'relative', // 确保 Card 内部绝对定位正常
});

const inputContainerStyle: React.CSSProperties = {
  flexShrink: 0,
  padding: '24px 0',
  zIndex: 10,
};

const inputWrapperStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '24px',
  padding: '8px 8px 8px 24px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  transition: 'all 0.3s',
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  // 1. 优先尝试现代 API (HTTPS)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API error, trying fallback...', err);
    }
  }
  // 2. 降级使用 document.execCommand (HTTP)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px'; // 移出可视区域
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// 🔥 Google Colab 版 CodeBlock (修复双开页面问题 + 防抖)
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);
  // 1. 新增：运行状态锁
  const [isRunning, setIsRunning] = useState(false);

  // 兼容 HTTP 的复制函数 (保持不变)
  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      message.success('复制成功');
    } else {
      message.error('复制失败，请手动复制');
    }
  };

  const handleRun = async () => {
    // 2. 检查：如果正在运行，直接阻止
    if (isRunning) return;

    // 3. 上锁
    setIsRunning(true);

    try {
      let finalCode = code;
      let runMessage = '代码已复制！前往 Google Colab 运行 🚀';
      const isPythonPlot =
        language === 'python' && (code.includes('matplotlib') || code.includes('plt.'));
      const hasChinese = /[\u4e00-\u9fa5]/.test(code);

      if (isPythonPlot && hasChinese) {
        const colabPatch = `# 📦 [AI 自动修复] 下载中文字体以解决乱码
!wget -q https://github.com/StellarCN/scp_zh/raw/master/fonts/SimHei.ttf -O SimHei.ttf
import matplotlib.pyplot as plt
import matplotlib as mpl
mpl.font_manager.fontManager.addfont('SimHei.ttf')
plt.rcParams['font.sans-serif']=['SimHei']
plt.rcParams['axes.unicode_minus']=False
# ------------------------------------------------------
`;
        finalCode = colabPatch + code;
        runMessage = '已自动注入中文字体修复补丁 💉，请在 Colab 中粘贴运行！';
      }

      // 执行复制
      const success = await copyToClipboard(finalCode);

      if (success) {
        message.success(runMessage);
        // 4. 只有在这里打开一次窗口
        window.open('https://colab.research.google.com/#create=true', '_blank');
      } else {
        message.error('自动复制失败，请手动复制代码');
      }
    } catch (error) {
      console.error(error);
    } finally {
      // 5. 解锁 (无论成功失败，1秒后恢复按钮状态，防止立刻误触)
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '12px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#1e1e1e',
          borderBottom: '1px solid #333',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span
            style={{ marginLeft: '8px', fontSize: '12px', color: '#999', fontFamily: 'monospace' }}
          >
            {language}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {language === 'python' && (
            <Tooltip title="自动修复中文并跳转 Colab">
              <Button
                type="text"
                size="small"
                // 6. 绑定 loading 状态，运行时显示转圈圈
                loading={isRunning}
                icon={!isRunning && <PlayCircleOutlined />}
                onClick={handleRun}
                style={{ color: '#4caf50', fontSize: '12px' }}
              >
                {isRunning ? '跳转中' : '运行'}
              </Button>
            </Tooltip>
          )}
          <Tooltip title={copied ? '已复制' : '复制代码'}>
            <Button
              type="text"
              size="small"
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
              style={{ color: '#fff', fontSize: '12px' }}
            />
          </Tooltip>
        </div>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// 🔥 三态图片组件
const ImageRenderer = ({ src, alt, ...props }: ImgComponentProps) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  if (status === 'error') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          margin: '16px 0',
        }}
      >
        <div style={{ fontSize: '32px', opacity: 0.5 }}>🍂</div>
        <div style={{ color: '#666', fontSize: '14px', fontWeight: 500 }}>图片加载失败</div>
        <div
          style={{ color: '#999', fontSize: '12px', wordBreak: 'break-all', textAlign: 'center' }}
        >
          {src}
        </div>
      </div>
    );
  }
  return (
    <div style={{ margin: '16px 0', position: 'relative', minHeight: '100px' }}>
      {status === 'loading' && (
        <div
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '200px',
            backgroundColor: '#f5f5f5',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#999',
            gap: '8px',
            border: '1px solid #eee',
          }}
        >
          <Spin size="default" />
          <span style={{ fontSize: '12px' }}>图片加载中...</span>
        </div>
      )}
      <img
        {...props}
        src={src}
        alt={alt}
        onLoad={() => setStatus('success')}
        onError={() => setStatus('error')}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          display: status === 'success' ? 'block' : 'none',
        }}
      />
      {status === 'success' && alt && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
          {alt}
        </div>
      )}
    </div>
  );
};

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '你好！我是你的 AI 学习伙伴。我可以为你生成代码、数学公式，甚至绘制图表（通过图片链接）！',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  // ✅ 保持：使用 State 管理 SessionId (按照你的要求保留)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // ✅ 保持：Mount 时清除本地存储，防止污染
  useEffect(() => {
    localStorage.removeItem('chat_session_id');
  }, []);

  // 懒初始化用户等级
  const [userLevel] = useState(() => {
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        return userInfo?.level || 1;
      }
    } catch (e) {
      console.warn(`Load user level failed err: ${e}`);
    }
    return 1;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopyMessage = async (content: string) => {
    const success = await copyToClipboard(content); // 使用兼容函数

    if (success) {
      message.success('已复制全部内容');
    } else {
      message.error('复制失败，请手动选择复制');
    }
    message.success('已复制全部内容');
  };

  const handleRealStreamResponse = async (userQuestion: string) => {
    setIsStreaming(true);
    const newAiMsgId = Date.now().toString() + '-ai';

    setMessages((prev) => [
      ...prev,
      { id: newAiMsgId, role: 'assistant', content: '', loading: true },
    ]);

    try {
      await streamChat({
        message: userQuestion,
        // ✅ 保持：传入 State 中的 sessionId
        sessionId: currentSessionId,
        userLevel: userLevel,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newAiMsgId
                ? { ...msg, content: msg.content + chunk, loading: false }
                : msg,
            ),
          );
        },
        onDone: () => setIsStreaming(false),
        onError: (error) => {
          console.error('Stream error:', error);
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newAiMsgId
                ? { ...msg, content: msg.content + '\n\n⚠️ *网络连接中断*', loading: false }
                : msg,
            ),
          );
        },
        // ✅ 保持：接收并更新 State
        onSessionIdReceived: (newId) => {
          setCurrentSessionId(newId);
        },
      });
    } catch (err) {
      console.error('Request failed', err);
      setIsStreaming(false);
    }
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
    handleRealStreamResponse(inputValue);
  };

  const handleStop = () => {
    setIsStreaming(false);
    message.info('已停止生成');
  };

  return (
    <div style={chatContainerStyle}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '16px', minHeight: 0 }}>
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
              // 交互：在最外层容器监听悬停
              onMouseEnter={() => setHoveredMessageId(item.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
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
              <div style={{ maxWidth: '75%', minWidth: '300px' }}>
                <div
                  style={{
                    fontSize: 12,
                    color: '#B2BEC3',
                    marginBottom: 6,
                    textAlign: item.role === 'user' ? 'right' : 'left',
                    padding: '0 4px',
                  }}
                >
                  {item.role === 'user' ? '你' : 'AI 导师'}
                </div>

                <Card
                  size="small"
                  style={messageBubbleStyle(item.role)}
                  styles={{
                    body: {
                      // 🔥 UI 修复 1：底部增加 padding，避免按钮挡住文字
                      padding: '20px 28px 32px 28px',
                      position: 'relative', // 确保按钮相对于 Card 内部定位
                    },
                  }}
                >
                  {item.loading && !item.content ? (
                    <Spin size="small" />
                  ) : (
                    <div className="markdown-body">
                      {item.role === 'assistant' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            img: ImageRenderer,
                            code({ inline, className, children, ...props }: CodeComponentProps) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');
                              if (!inline && match)
                                return <CodeBlock language={match[1]} code={codeString} />;
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {item.content}
                        </ReactMarkdown>
                      ) : (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{item.content}</span>
                      )}
                    </div>
                  )}

                  {/* 🔥 UI 修复 2：复制按钮内嵌到 Card 右下角 */}
                  {hoveredMessageId === item.id && !item.loading && item.content && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px', // 紧贴底部
                        right: '8px', // 紧贴右侧
                        zIndex: 10,
                      }}
                    >
                      <Tooltip title="复制全部内容" placement="left">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyMessage(item.content)}
                          style={{
                            color: item.role === 'user' ? 'rgba(255,255,255,0.8)' : '#999',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background:
                              item.role === 'user' ? 'rgba(0,0,0,0.1)' : 'rgba(240,240,240,0.5)',
                            borderRadius: '4px',
                            padding: '0 8px',
                            height: '24px', // 横向按钮高度
                          }}
                        >
                          复制
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
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
              variant="borderless"
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
            AI 可能会犯错，请核实重要信息。支持 Markdown、LaTeX 公式及代码高亮。
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatArea;

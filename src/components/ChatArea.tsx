import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ComponentPropsWithoutRef,
} from 'react';
import {
  Input,
  Button,
  Avatar,
  Card,
  Spin,
  message,
  Tooltip,
  Modal,
  Alert,
  Collapse,
  theme,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  StopOutlined,
  CopyOutlined,
  CheckOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  ReloadOutlined,
  CaretRightOutlined, // 🆕 新增图标
  BulbOutlined, // 🆕 新增图标
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
  thought?: string; // 🆕 新增：思考过程字段
  loading?: boolean;
}

type CodeComponentProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  node?: object;
};

type ImgComponentProps = ComponentPropsWithoutRef<'img'> & {
  node?: object;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadPyodide: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pyodideInstance: any;
  }
}

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
  position: 'relative',
});

const inputContainerStyle: React.CSSProperties = { flexShrink: 0, padding: '24px 0', zIndex: 10 };
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

// 🔥 🆕 组件：深度思考过程展示
const ThinkProcess = ({ content, isStreaming }: { content: string; isStreaming?: boolean }) => {
  const { token } = theme.useToken();

  if (!content) return null;

  return (
    <div style={{ marginBottom: '12px' }}>
      <Collapse
        ghost
        size="small"
        items={[
          {
            key: '1',
            label: (
              <span
                style={{
                  color: token.colorTextDescription,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isStreaming ? <Spin size="small" /> : <BulbOutlined />}
                深度思考过程
                <span style={{ opacity: 0.6 }}>({content.length} 字)</span>
              </span>
            ),
            children: (
              <div
                style={{
                  fontSize: '13px',
                  color: '#666',
                  borderLeft: '3px solid #e0e0e0',
                  paddingLeft: '12px',
                  marginLeft: '4px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  fontFamily: 'sans-serif',
                }}
              >
                {content}
              </div>
            ),
          },
        ]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            rotate={isActive ? 90 : 0}
            style={{ fontSize: '12px', color: '#999' }}
          />
        )}
      />
    </div>
  );
};

// 🔥 核心工具：加载 Pyodide CDN
const loadPyodideScript = async () => {
  if (window.loadPyodide) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 🔥 核心组件：CodeRunnerModal
const CodeRunnerModal = ({
  isOpen,
  onClose,
  code,
}: {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('准备就绪');
  const [isFatalError, setIsFatalError] = useState(false);

  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const runPythonCode = async () => {
    setIsLoading(true);
    setLogs([]);
    setPlotImage(null);
    setIsFatalError(false);
    setStatusText('正在初始化环境...');

    try {
      await loadPyodideScript();

      if (!window.pyodideInstance) {
        setStatusText('正在启动 Python 虚拟机...');
        window.pyodideInstance = await window.loadPyodide();
      }
      const pyodide = window.pyodideInstance;

      setStatusText('正在加载 Numpy/Scipy/Pandas...');
      await pyodide.loadPackage(['numpy', 'matplotlib', 'scipy', 'pandas']);

      setStatusText('正在配置中文字体 (SimHei)...');

      const fontSetupCode = `
import os
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from pyodide.http import pyfetch 

font_path = "SimHei.ttf"

async def download_font():
    if os.path.exists(font_path):
        return True
    
    print("正在下载中文字体...")
    url = "https://cdn.jsdelivr.net/gh/StellarCN/scp_zh@master/fonts/SimHei.ttf"
    
    try:
        response = await pyfetch(url)
        if response.status == 200:
            with open(font_path, "wb") as f:
                f.write(await response.bytes()) 
            print("字体下载成功！")
            return True
    except Exception as e:
        print(f"⚠️ 字体下载失败: {str(e)}")
        return False

await download_font()

try:
    fm.fontManager.addfont(font_path)
    plt.rcParams['font.sans-serif']=['SimHei']
    plt.rcParams['axes.unicode_minus']=False
except:
    pass
`;
      await pyodide.runPythonAsync(fontSetupCode);

      pyodide.setStdout({
        batched: (msg: string) => setLogs((prev) => [...prev, msg]),
      });

      const smartImports = `
import numpy as np
import pandas as pd
import scipy
from numpy.fft import fft, ifft, fftfreq, fftshift
import matplotlib.pyplot as plt
`;

      const plotPatch = `
import io, base64
def _get_plot_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')
plt.clf()
`;

      setStatusText('正在执行仿真...');
      await pyodide.runPythonAsync(smartImports + '\n' + plotPatch + '\n' + codeRef.current);

      const hasPlot = pyodide.runPython('len(plt.get_fignums()) > 0');
      if (hasPlot) {
        const base64Img = pyodide.runPython('_get_plot_base64()');
        setPlotImage(`data:image/png;base64,${base64Img}`);
      }

      setStatusText('执行完成 ✅');
    } catch (err) {
      console.error('Pyodide Error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      if (errorMsg.includes('fatally failed')) {
        setIsFatalError(true);
        setStatusText('❌ 运行环境已崩溃');
        setLogs((prev) => [...prev, 'Critical Error: Python 虚拟机已崩溃，请刷新页面重试。']);
      } else {
        setStatusText('执行出错 ❌');
        setLogs((prev) => [...prev, `Error: ${errorMsg}`]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runPythonCode();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CodeOutlined style={{ color: '#1890ff' }} />
          <span>Python 仿真控制台</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      maskClosable={false}
      keyboard={false}
      width={800}
      centered
      destroyOnClose
      footer={
        isFatalError
          ? [
              <Button
                key="refresh"
                type="primary"
                danger
                onClick={handleRefresh}
                icon={<ReloadOutlined />}
              >
                刷新页面修复环境
              </Button>,
            ]
          : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
        {isFatalError && (
          <Alert
            message="运行环境崩溃"
            description="检测到 Pyodide 发生致命错误 (Fatally Failed)。请点击下方的“刷新页面”按钮来重置环境。"
            type="error"
            showIcon
          />
        )}

        {!isFatalError && isLoading && (
          <Alert message={statusText} type="info" showIcon icon={<Spin />} />
        )}
        {!isFatalError && !isLoading && logs.length === 0 && !plotImage && (
          <Alert message={statusText} type="success" showIcon />
        )}

        {plotImage && (
          <div
            style={{
              textAlign: 'center',
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #eee',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>📈 仿真结果视图</h4>
            <img
              src={plotImage}
              alt="Simulation Plot"
              style={{ maxWidth: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </div>
        )}

        <div
          style={{
            flex: 1,
            background: '#1e1e1e',
            color: '#00ff00',
            fontFamily: 'monospace',
            padding: '12px',
            borderRadius: '8px',
            overflowY: 'auto',
            maxHeight: '300px',
            minHeight: '150px',
          }}
        >
          <div
            style={{
              color: '#aaa',
              borderBottom: '1px solid #333',
              paddingBottom: '4px',
              marginBottom: '8px',
              fontSize: '12px',
            }}
          >
            🖥️ Terminal Output
          </div>
          {logs.length === 0 && !isLoading ? (
            <span style={{ color: '#666' }}>[暂无输出]</span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </Modal>
  );
};

// 兼容复制
const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* ignore */
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
};

// CodeBlock 纯展示组件
const CodeBlock = React.memo(
  ({
    language,
    code,
    onRun,
  }: {
    language: string;
    code: string;
    onRun: (code: string) => void;
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      const success = await copyToClipboard(code);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        message.success('复制成功');
      } else {
        message.error('复制失败');
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
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#999',
                fontFamily: 'monospace',
              }}
            >
              {language}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {language === 'python' && (
              <Tooltip title="在浏览器中运行仿真 (支持中文/Matlab/Scipy)">
                <Button
                  type="text"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => onRun(code)}
                  style={{ color: '#4caf50', fontSize: '12px' }}
                >
                  运行仿真
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
  },
);

// ImageRenderer
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 弹窗状态
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [runnerCode, setRunnerCode] = useState('');

  useEffect(() => {
    localStorage.removeItem('chat_session_id');
  }, []);

  const [userLevel] = useState(() => {
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) return JSON.parse(userInfoStr)?.level || 1;
    } catch {
      /* ignore */
    }
    return 1;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopyMessage = async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) message.success('已复制全部内容');
    else message.error('复制失败');
  };

  const handleOpenRunner = useCallback((code: string) => {
    setRunnerCode(code);
    setIsRunnerOpen(true);
  }, []);

  const markdownComponents = useMemo(
    () => ({
      img: ImageRenderer,
      code({ inline, className, children, ...props }: CodeComponentProps) {
        const match = /language-(\w+)/.exec(className || '');
        const codeString = String(children).replace(/\n$/, '');
        if (!inline && match) {
          return <CodeBlock language={match[1]} code={codeString} onRun={handleOpenRunner} />;
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    [handleOpenRunner],
  );

  const handleRealStreamResponse = async (userQuestion: string) => {
    setIsStreaming(true);
    const newAiMsgId = Date.now().toString() + '-ai';

    // 初始化消息，包含 thought 字段
    setMessages((prev) => [
      ...prev,
      { id: newAiMsgId, role: 'assistant', content: '', thought: '', loading: true },
    ]);

    try {
      await streamChat({
        message: userQuestion,
        sessionId: currentSessionId,
        userLevel: userLevel,
        // 处理正文流
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newAiMsgId
                ? { ...msg, content: msg.content + chunk, loading: false }
                : msg,
            ),
          );
        },
        // 🆕 处理思考流
        onThought: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newAiMsgId
                ? { ...msg, thought: (msg.thought || '') + chunk, loading: true }
                : msg,
            ),
          );
        },
        onDone: () => setIsStreaming(false),
        onError: (error) => {
          console.error(error);
          setIsStreaming(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newAiMsgId
                ? { ...msg, content: msg.content + '\n\n⚠️ *网络连接中断*', loading: false }
                : msg,
            ),
          );
        },
        onSessionIdReceived: (newId) => setCurrentSessionId(newId),
      });
    } catch (err) {
      console.error(err);
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
                  styles={{ body: { padding: '20px 28px 32px 28px', position: 'relative' } }}
                >
                  {item.loading && !item.content && !item.thought ? (
                    <Spin size="small" />
                  ) : (
                    <div className="markdown-body">
                      {/* 🆕 渲染思考过程 (仅对 Assistant 且内容不为空时) */}
                      {item.role === 'assistant' && item.thought && (
                        <ThinkProcess content={item.thought} isStreaming={item.loading} />
                      )}

                      {item.role === 'assistant' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={markdownComponents}
                        >
                          {item.content}
                        </ReactMarkdown>
                      ) : (
                        <span style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>
                          {item.content}
                        </span>
                      )}
                    </div>
                  )}
                  {hoveredMessageId === item.id && !item.loading && item.content && (
                    <div style={{ position: 'absolute', bottom: '6px', right: '8px', zIndex: 10 }}>
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
                            height: '24px',
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

      <CodeRunnerModal
        isOpen={isRunnerOpen}
        onClose={() => setIsRunnerOpen(false)}
        code={runnerCode}
      />
    </div>
  );
};
export default ChatArea;

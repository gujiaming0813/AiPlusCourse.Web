import React from 'react';
import ChatArea from '@/components/ChatArea';

const ChatPage: React.FC = () => {
  return (
    // 关键点 3：高度必须是 100%，去占满 BasicLayout 给它的那个坑
    <div style={{ height: '100%', width: '100%', background: '#fff' }}>
      <ChatArea />
    </div>
  );
};

export default ChatPage;

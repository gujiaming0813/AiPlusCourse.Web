import React from 'react';
import ChatArea from '@/components/ChatArea';

const ChatPage: React.FC = () => {
  return (
    // Remove background to allow BasicLayout's gradient to show through
    <div style={{ height: '100%', width: '100%' }}>
      <ChatArea />
    </div>
  );
};

export default ChatPage;

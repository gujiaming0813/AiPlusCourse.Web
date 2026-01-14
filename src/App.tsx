import React from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import router from './router';

/**
 * Global Design System Configuration (based on SKILL.md)
 *
 * This ConfigProvider injects a consistent theme across the entire application,
 * ensuring that all components adhere to the AI Teacher design language.
 */
const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        // 1. Global Tokens
        token: {
          // Primary color for interactive elements
          colorPrimary: '#7C5CFF', // Vibrant, professional purple
          // Default border radius for most components
          borderRadius: 16,
          // Main font for readability and modern feel
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        },
        // 2. Component-level Overrides
        components: {
          Card: {
            borderRadiusLG: 24, // Larger radius for main content cards
            paddingLG: 32, // More spacious padding
          },
          Button: {
            borderRadius: 16, // Consistent with global radius
            controlHeight: 48, // Taller, more clickable buttons
            boxShadow: 'none', // Remove default shadow to allow for custom Claymorphism styles
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;

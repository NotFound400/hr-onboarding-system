import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

interface PageContainerProps {
  children: React.ReactNode;
  title?: string; // 可选：如果传入标题，会自动显示在顶部
  loading?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title,
  loading = false 
}) => {
  return (
    <div
      style={{
        width: '80%',        // 核心需求：占 80%
        maxWidth: '1200px',  // 优化：防止在超大屏幕(4K)上太宽，限制最大宽度
        margin: '0 auto',    // 核心需求：水平居中
        padding: '24px 0',   // 上下留点呼吸空间
      }}
    >
      {/* 统一的页面标题部分 */}
      {title && (
        <Title level={2} style={{ marginBottom: 24 }}>
          {title}
        </Title>
      )}

      {/* 统一的内容卡片 */}
      <Card loading={loading} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {children}
      </Card>
    </div>
  );
};
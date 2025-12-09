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
    <div style={{ width: '100%' }}>
      {/* 统一的页面标题部分 */}
      {title && (
        <Title level={2} style={{ marginBottom: 24 }}>
          {title}
        </Title>
      )}

      {/* 内容区域 - 不再包裹 Card，避免双层卡片 */}
      {loading ? (
        <Card loading={loading} bordered={false} />
      ) : (
        children
      )}
    </div>
  );
};
import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  loading?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title,
  loading = false 
}) => {
  return (
    <div style={{ width: '100%' }}>
      {title && (
        <Title level={2} style={{ marginBottom: 24 }}>
          {title}
        </Title>
      )}

      {loading ? (
        <Card loading={loading} bordered={false} />
      ) : (
        children
      )}
    </div>
  );
};
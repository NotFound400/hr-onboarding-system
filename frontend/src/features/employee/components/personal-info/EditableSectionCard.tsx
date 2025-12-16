import React from 'react';
import { Card, Button, Space, Modal } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

interface EditableSectionCardProps {
  title: string;
  headerColor?: string;
  icon?: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  readView: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  extraContent?: React.ReactNode;
}

const EditableSectionCard: React.FC<EditableSectionCardProps> = ({
  title,
  headerColor = '#d9d9d9',
  icon,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  loading = false,
  readView,
  children,
  style,
  extraContent,
}) => {
  const handleCancelClick = () => {
    Modal.confirm({
      title: 'Discard Changes',
      content: 'Are you sure to discard all your changes?',
      okText: 'Yes, Discard',
      cancelText: 'No, Keep Editing',
      okButtonProps: { danger: true },
      onOk: () => {
        onCancel();
      },
    });
  };

  const renderActions = () => {
    if (isEditing) {
      return (
        <Space size="small">
          {extraContent}
          <Button 
            size="small"
            icon={<CloseOutlined />} 
            onClick={handleCancelClick}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            size="small"
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={onSave}
            loading={loading}
          >
            Save
          </Button>
        </Space>
      );
    }

    return (
      <Space size="small">
        {extraContent}
        <Button 
          size="small"
          type="link"
          icon={<EditOutlined />} 
          onClick={onEdit}
        >
          Edit
        </Button>
      </Space>
    );
  };

  return (
    <Card
      title={
        <Space>
          {icon}
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{title}</span>
        </Space>
      }
      extra={renderActions()}
      style={{
        ...style,
        borderTop: `3px solid ${headerColor}`,
        borderRadius: '2px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
      styles={{
        header: {
          padding: '12px 16px',
          minHeight: 'auto',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
        },
        body: {
          padding: '16px',
        },
      }}
    >
      {isEditing ? children : readView}
    </Card>
  );
};

export default EditableSectionCard;

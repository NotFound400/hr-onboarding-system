/**
 * EditableSectionCard - 可编辑板块卡片组件
 * 
 * Section 6(c) 通用包装器：封装所有板块的统一交互模式
 * - Edit 按钮 → Save & Cancel 按钮
 * - Cancel 显示确认对话框 (严格文案匹配)
 * - Loading 状态管理
 * 
 * @example
 * <EditableSectionCard
 *   title="Name"
 *   isEditing={editingSection === 'name'}
 *   onEdit={() => handleEdit('name')}
 *   onSave={() => handleSave('name')}
 *   onCancel={() => handleCancel('name')}
 *   loading={saving === 'name'}
 *   readView={<NameReadView data={employee} />}
 * >
 *   <NameEditForm form={form} />
 * </EditableSectionCard>
 */

import React from 'react';
import { Card, Button, Space, Modal } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

interface EditableSectionCardProps {
  /** 板块标题 */
  title: string;
  /** 顶部彩色边框颜色 (如 #1890ff, #52c41a) */
  headerColor?: string;
  /** 标题旁的图标 */
  icon?: React.ReactNode;
  /** 是否处于编辑模式 */
  isEditing: boolean;
  /** 点击 Edit 按钮的回调 */
  onEdit: () => void;
  /** 点击 Save 按钮的回调 */
  onSave: () => void;
  /** 点击 Cancel 按钮的回调 */
  onCancel: () => void;
  /** 保存中的加载状态 */
  loading?: boolean;
  /** 只读视图内容 */
  readView: React.ReactNode;
  /** 编辑表单内容 (children) */
  children: React.ReactNode;
  /** 额外的样式 */
  style?: React.CSSProperties;
  /** Card 的 extra 区域额外内容 */
  extraContent?: React.ReactNode;
}

/**
 * EditableSectionCard Component
 */
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
  /**
   * Section 6(c): "If the user clicks Cancel, an alert should appear: 
   * 'Are you sure to discard all your changes?'"
   * 
   * 统一的取消确认对话框
   */
  const handleCancelClick = () => {
    Modal.confirm({
      title: 'Discard Changes',
      content: 'Are you sure to discard all your changes?', // 严格匹配原文
      okText: 'Yes, Discard',
      cancelText: 'No, Keep Editing',
      okButtonProps: { danger: true },
      onOk: () => {
        onCancel();
      },
    });
  };

  /**
   * 渲染操作按钮区域 (Dashboard Style: 小按钮 + Link 风格)
   */
  const renderActions = () => {
    if (isEditing) {
      // Section 6(c): "replaced by Save and Cancel buttons"
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

    // Section 6(c): "Each section should have an Edit button"
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

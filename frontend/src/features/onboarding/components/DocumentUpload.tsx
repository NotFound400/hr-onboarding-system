import { useState } from 'react';
import { Upload, Button, Modal } from 'antd';
import { UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useAntdMessage } from '../../../hooks/useAntdMessage';

interface DocumentUploadProps {
  /** 文档标题 */
  title: string;
  /** 是否必填 */
  required?: boolean;
  /** 已上传的文件列表 */
  fileList?: UploadFile[];
  /** 文件变化回调 */
  onChange?: (fileList: UploadFile[]) => void;
  /** 最大文件数量 */
  maxCount?: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  required = false,
  fileList = [],
  onChange,
  maxCount = 1,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const messageApi = useAntdMessage();

  const handleUpload: UploadProps['customRequest'] = ({ file, onSuccess }) => {
    setTimeout(() => {
      if (onSuccess) {
        onSuccess('ok');
      }
      messageApi.success(`${(file as File).name} uploaded successfully`);
    }, 1000);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if (onChange) {
      onChange(newFileList);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    let url = file.url || file.preview;

    if (!url && file.originFileObj) {
      url = URL.createObjectURL(file.originFileObj);
    }

    if (url) {
      setPreviewUrl(url);
      setPreviewTitle(file.name);
      setPreviewVisible(true);
    }
  };

  const handleDownload = (file: UploadFile) => {
    const url = file.url || file.preview;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      messageApi.success('Download started');
    }
  };

  const itemRender: UploadProps['itemRender'] = (_originNode, file) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </span>
        <div>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(file)}
            size="small"
          >
            Preview
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(file)}
            size="small"
          >
            Download
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>
          {title}
          {required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
        </span>
      </div>

      <Upload
        customRequest={handleUpload}
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        maxCount={maxCount}
        itemRender={itemRender}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      >
        {fileList.length < maxCount && (
          <Button icon={<UploadOutlined />}>Upload Document</Button>
        )}
      </Upload>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => {
            const file = fileList.find(f => f.name === previewTitle);
            if (file) handleDownload(file);
          }}>
            Download
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        bodyStyle={{ height: '600px', overflow: 'auto' }}
      >
        {previewUrl && (
          <object
            data={previewUrl}
            type="application/pdf"
            width="100%"
            height="550px"
            style={{ border: 'none' }}
          >
            <p>
              Unable to display preview.{' '}
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                Click here to view in new tab
              </a>
            </p>
          </object>
        )}
      </Modal>
    </div>
  );
};

export default DocumentUpload;

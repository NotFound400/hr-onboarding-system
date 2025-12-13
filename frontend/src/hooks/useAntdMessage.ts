import { App as AntdApp } from 'antd';

export const useAntdMessage = () => {
  const { message } = AntdApp.useApp();
  return message;
};

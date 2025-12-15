import type { MessageInstance } from 'antd/es/message/interface';

let globalMessageApi: MessageInstance | null = null;

export const setGlobalMessageApi = (instance: MessageInstance) => {
  globalMessageApi = instance;
};

export const getGlobalMessageApi = (): MessageInstance | null => globalMessageApi;

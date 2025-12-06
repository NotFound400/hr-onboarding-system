/**
 * Redux Typed Hooks
 * 导出类型化的 Redux hooks，用于组件中使用
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * 类型化的 useDispatch hook
 * 使用此 hook 代替原生的 useDispatch，可以获得完整的类型推断
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * 类型化的 useSelector hook
 * 使用此 hook 代替原生的 useSelector，可以获得完整的类型推断
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

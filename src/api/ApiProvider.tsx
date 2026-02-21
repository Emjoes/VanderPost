import React, { createContext, useRef, useState } from 'react';
import { API_URL, DEBUG } from '../config';

export type ApiRequestOptions<TData = any, TResponse = any> = {
  url?: RequestInfo;
  query?: string;
  data?: TData;
  token?: string | null;
  method?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  onSuccess?: (response: TResponse) => void;
  onError?: (error: any, raw?: Response) => void;
  onFinally?: () => void;
};

export type ApiContextType = {
  isGlobalLoading: boolean;
  apiRequest: <TResponse = any, TData = any>(
    options: ApiRequestOptions<TData, TResponse>
  ) => Promise<Awaited<TResponse> | undefined>;
};

export const ApiContext = createContext<ApiContextType | undefined>(undefined);

const SHOW_DELAY = 150;

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const counterRef = useRef(0);
  const delayTimerRef = useRef<number | null>(null);

  const show = () => {
    counterRef.current += 1;
    if (!delayTimerRef.current) {
      delayTimerRef.current = window.setTimeout(() => {
        setIsGlobalLoading(true);
        delayTimerRef.current = null;
      }, SHOW_DELAY);
    }
  };

  const hide = () => {
    counterRef.current = Math.max(0, counterRef.current - 1);

    if (counterRef.current === 0) {
      if (delayTimerRef.current != null) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      setIsGlobalLoading(false);
    }
  };

  const apiRequest = async <TResponse = any, TData = any>({
    url = API_URL,
    query,
    data,
    token,
    method = 'POST',
    headers,
    onSuccess,
    onError,
    onFinally,
  }: ApiRequestOptions<TData, TResponse>): Promise<Awaited<TResponse> | undefined> => {
    show();

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body:
          method !== 'GET'
            ? JSON.stringify({
                ...(query ? { method: query } : {}),
                data: {
                  ...(data ?? {}),
                  ...(token ? { token } : {}),
                },
              })
            : undefined,
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {}

      if (DEBUG) {
        console.log('[API]', query, res.status, json)
        await new Promise(resolve => setTimeout(resolve, 1500));
      };
      
      if (res.ok && json?.status === 'ok') {
        onSuccess?.(json);
        return json;
      }

      onError?.(json);
    } catch (err) {
      onError?.(err);
    } finally {
      onFinally?.();
      hide();
    }
  };

  return (
    <ApiContext.Provider value={{ isGlobalLoading, apiRequest }}>
      {children}
      {isGlobalLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </ApiContext.Provider>
  );
};

import { useState, useRef, useEffect } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, Pencil, Sparkles } from 'lucide-react';
import type { AITool, SocialPlatform, AIToolConfig } from '../../App';
import { useTranslation } from 'react-i18next';
import { CoinBadge } from '../../components/CoinBadge';
import { CharacterCounter } from '../../components/CharacterCounter';
import { INPUT_LIMITS } from '../../config';

interface ContentComposerProps {
  selectedTools: AITool[];
  selectedPlatforms: SocialPlatform[];
  aiTools: AIToolConfig[];
  coinBalance: number;
  selectedToolsCoins: number;
  onSavePost: (content: { text?: string; image?: string; video?: string }, status: 'generated' | 'sent') => void;
  onSpendCoins: (coins: number) => void;
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: {
    text?: string;
    image?: string;
    video?: string;
  };
  tools?: Array<{ id: AITool; name: string }>;
  status?: 'pending' | 'ready';
  published?: boolean;
};

export function ContentComposer({
  selectedTools,
  selectedPlatforms,
  aiTools,
  coinBalance,
  selectedToolsCoins,
  onSavePost,
  onSpendCoins,
}: ContentComposerProps) {
  const { t } = useTranslation();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const BOTTOM_VISIBILITY_THRESHOLD = 56;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (!prompt) {
      textarea.rows = 1;
      return;
    }

    textarea.rows = 1;

    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10);
    const currentRows = Math.floor(textarea.scrollHeight / lineHeight) - 1;

    textarea.rows = Math.min(currentRows, 8);
  }, [prompt]);

  const updateScrollToBottomVisibility = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const isAtBottom = dialog.scrollHeight - dialog.scrollTop - dialog.clientHeight <= BOTTOM_VISIBILITY_THRESHOLD;
    setShowScrollToBottom(!isAtBottom);
  };

  const scrollDialogToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.scrollTo({
      top: dialog.scrollHeight,
      behavior,
    });
    setShowScrollToBottom(false);
  };

  const scheduleScrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollDialogToBottom(behavior);
      });
    });
  };

  useEffect(() => {
    updateScrollToBottomVisibility();
  }, [messages]);

  const buildToolSnapshot = (tools: AITool[]) => {
    return tools
      .map(toolId => aiTools.find(tool => tool.id === toolId))
      .filter((tool): tool is AIToolConfig => Boolean(tool))
      .map(tool => ({ id: tool.id, name: tool.name }));
  };

  const buildGeneratedContent = (promptText: string, toolsSnapshot: AITool[]) => {
    const content: ChatMessage['content'] = {};

    if (toolsSnapshot.includes('chatgpt')) {
      content.text = `Generated text for: ${promptText}`;
    }

    if (toolsSnapshot.includes('dalle')) {
      content.image = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1024&h=1024&fit=crop';
    }

    if (toolsSnapshot.includes('sora')) {
      content.video = 'video_placeholder.mp4';
    }

    return content;
  };

  const handleCopy = async (messageId: string, text?: string) => {
    const value = text?.trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = value;
      fallback.setAttribute('readonly', 'true');
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.focus();
      fallback.select();
      document.execCommand('copy');
      document.body.removeChild(fallback);
    }

    setCopiedMessageId(messageId);
    window.setTimeout(() => {
      setCopiedMessageId(current => (current === messageId ? null : current));
    }, 1200);
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditingText(message.content.text ?? '');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = () => {
    if (!editingMessageId) return;

    setMessages(prev => prev.map(message => (
      message.id === editingMessageId
        ? { ...message, content: { ...message.content, text: editingText } }
        : message
    )));

    setEditingMessageId(null);
    setEditingText('');
  };

  const handleGenerate = () => {
    if (!prompt.trim() || selectedTools.length === 0 || isGenerating) return;
    if (coinBalance < selectedToolsCoins) {
      alert(t('contentprompt-insufficient-coins', { required: selectedToolsCoins, balance: coinBalance }));
      return;
    }

    const promptText = prompt.trim();
    const toolsSnapshot = [...selectedTools];
    const toolLabels = buildToolSnapshot(toolsSnapshot);
    const timestamp = Date.now();
    const userMessageId = `${timestamp}-user`;
    const assistantMessageId = `${timestamp}-assistant`;

    setPrompt('');
    setIsGenerating(true);
    onSpendCoins(selectedToolsCoins);

    setMessages(prev => ([
      ...prev,
      {
        id: userMessageId,
        role: 'user',
        content: { text: promptText },
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        status: 'pending',
        content: { text: '' },
        tools: toolLabels,
      },
    ]));
    scheduleScrollToBottom();

    setTimeout(() => {
      const content = buildGeneratedContent(promptText, toolsSnapshot);
      onSavePost(content, 'generated');

      setMessages(prev => prev.map(message => (
        message.id === assistantMessageId
          ? { ...message, status: 'ready', content }
          : message
      )));
      scheduleScrollToBottom();

      setIsGenerating(false);
    }, 3000);
  };

  const handlePublish = (messageId: string) => {
    const message = messages.find(item => item.id === messageId);
    if (!message || message.role !== 'assistant' || message.status !== 'ready') return;

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform to publish');
      return;
    }

    onSavePost(message.content, 'sent');
    setMessages(prev => prev.map(item => (
      item.id === messageId ? { ...item, published: true } : item
    )));
    alert(`Publishing to: ${selectedPlatforms.join(', ')}`);
  };

  return (
    <div className="flex-1 flex flex-col app-bg-pattern overflow-hidden">
      {/* Dialog Area */}
      <div
        ref={dialogRef}
        onScroll={updateScrollToBottomVisibility}
        className="flex-1 overflow-y-auto p-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                {t('contentprompt-no-content')}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {t('contentprompt-empty-instructions-1')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('contentprompt-empty-instructions-2')}
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto space-y-4 text-xs">
            {messages.map(message => {
              const isUser = message.role === 'user';
              const isPending = message.role === 'assistant' && message.status === 'pending';
              const isReadyAssistant = message.role === 'assistant' && message.status === 'ready';
              const isEditingAssistant = isReadyAssistant && editingMessageId === message.id;
              const canCopyText = Boolean(message.content.text?.trim());

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[320px] space-y-2">
                    {isUser && (
                      <div className="rounded-lg px-3 py-2 leading-relaxed bg-blue-600 text-white shadow-sm">
                        <p className="whitespace-pre-wrap text-xs">{message.content.text}</p>
                      </div>
                    )}

                    {!isUser && isPending && (
                      <div className="rounded-lg px-3 py-2 leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                        <p className="text-zinc-600 dark:text-zinc-300 text-xs">
                          {t('contentprompt-generating')}...
                        </p>
                      </div>
                    )}

                    {!isUser && isReadyAssistant && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex flex-wrap items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                          <span className="text-xs">{t('contentprompt-generated-with')}:</span>
                          {(message.tools ?? []).map(tool => (
                            <span
                              key={tool.id}
                              className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs"
                            >
                              {tool.name}
                            </span>
                          ))}
                        </div>

                        <div className="px-3 py-2 space-y-2 text-zinc-900 dark:text-zinc-100">
                          {message.content.image && (
                            <div className="mx-auto w-full max-w-[320px] aspect-square bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                              <img
                                src={message.content.image}
                                className="w-full h-full object-cover"
                                onLoad={() => scheduleScrollToBottom('auto')}
                              />
                            </div>
                          )}

                          {message.content.video && (
                            <div className="mx-auto w-full max-w-[320px] aspect-[9/16] bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden flex items-center justify-center">
                              <video
                                src={message.content.video}
                                controls
                                className="w-full h-full object-contain"
                                onLoadedMetadata={() => scheduleScrollToBottom('auto')}
                              />
                            </div>
                          )}

                          {isEditingAssistant ? (
                            <div className="space-y-2">
                              <div className="relative">
                                <textarea
                                  value={editingText}
                                  onChange={(event) => setEditingText(event.target.value)}
                                  maxLength={INPUT_LIMITS.generatedPostEdit}
                                  className="w-full min-h-20 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-y"
                                />
                                <CharacterCounter current={editingText.length} max={INPUT_LIMITS.generatedPostEdit} className="bottom-2" />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2.5 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs"
                                >
                                  {t('contentprompt-cancel')}
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs"
                                >
                                  {t('neurallist-save-button')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            message.content.text && (
                              <p className="whitespace-pre-wrap text-xs">
                                {message.content.text}
                              </p>
                            )
                          )}
                        </div>

                        {!isEditingAssistant && (
                          <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                            <button
                              onClick={() => handlePublish(message.id)}
                              disabled={selectedPlatforms.length === 0 || message.published}
                              className="w-full px-3 py-1.5 rounded-md bg-green-600 text-white enabled:hover:bg-green-700 disabled:opacity-50 disabled:cursor-default transition-colors text-xs"
                            >
                              {t('contentprompt-publish')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {(isUser || isReadyAssistant) && (
                      <div className={`h-6 flex items-center ${isUser ? 'justify-end' : 'justify-start'} gap-1 !mt-1`}>
                        {isUser && (
                          <button
                            onClick={() => handleCopy(message.id, message.content.text)}
                            disabled={!canCopyText}
                            className="w-6 h-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-default transition-colors flex items-center justify-center"
                            aria-label={t('contentprompt-copy')}
                          >
                            {copiedMessageId === message.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {isReadyAssistant && (
                          <>
                            <button
                              onClick={() => handleCopy(message.id, message.content.text)}
                              disabled={!canCopyText}
                              className={`w-6 h-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-default transition-colors flex items-center justify-center ${isEditingAssistant ? 'invisible pointer-events-none' : ''}`}
                              aria-label={t('contentprompt-copy')}
                            >
                              {copiedMessageId === message.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleStartEdit(message)}
                              className={`w-6 h-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center ${isEditingAssistant ? 'invisible pointer-events-none' : ''}`}
                              aria-label={t('contentprompt-edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="!mb-[2.75rem]"></div>
          </div>
        )}
      </div>

      {/* Composer Input */}
      <div className="relative bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        {showScrollToBottom && (
          <button
            type="button"
            onClick={() => scrollDialogToBottom()}
            aria-label={t('contentprompt-scroll-to-bottom')}
            className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {!isGenerating && selectedTools.length > 0 && selectedToolsCoins > 0 && (
          <div
            className="absolute top-0 left-0 -translate-y-full bg-white dark:bg-zinc-900 border-t border-e rounded-tr-xl border-zinc-200 dark:border-zinc-800 pt-2 ps-3 pe-2"
          >
            <CoinBadge coins={selectedToolsCoins} />
          </div>
        )}

        <div className="flex items-end gap-3 p-3">
          <div className="relative flex flex-1 items-center">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`${t('contentprompt-textarea-placeholder')}...`}
              maxLength={INPUT_LIMITS.contentPrompt}
              className="w-full px-2.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
            />
            <CharacterCounter current={prompt.length} max={INPUT_LIMITS.contentPrompt} className="bottom-[6px]" />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || selectedTools.length === 0 || isGenerating}
            aria-label={t('contentprompt-generate')}
            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center enabled:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

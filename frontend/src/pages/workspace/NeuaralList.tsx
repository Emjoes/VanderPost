import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import type { AIToolConfig, AITool } from '../../App';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChatgptModal } from '../../modals/ChatgptModal';
import { SoraModal } from '../../modals/SoraModal';
import { DalleModal } from '../../modals/DalleModal';

interface AIToolsListProps {
  tools: AIToolConfig[];
  selectedTools: AITool[];
  onToggleTool: (toolId: AITool) => void;
  onCoinsUpdate: (coinsByTool: Record<AITool, number>, totalSelectedCoins: number) => void;
}

type CoinFormula = `+${number}` | `x${number}`;

const TOOL_COIN_RULES: Record<
  AITool,
  Partial<Record<'model' | 'quality' | 'duration', Record<string, CoinFormula>>>
> = {
  chatgpt: {
    model: {
      'GPT-5 mini': '+5',
      'GPT-5.2': '+20',
      'GPT-5.2 Pro': '+250',
    },
  },
  sora: {
    model: {
      'Sora 2': '+200',
      'Sora 2 Pro': '+600',
    },
    quality: {
      '720 x 1280': '+0',
      '1280 x 720': '+0',
      '1024 x 1792': '+400',
      '1792 x 1024': '+400',
    },
    duration: {
      '4': 'x1',
      '8': 'x2',
      '12': 'x3',
    },
  },
  dalle: {
    model: {
      'DALL-E 2': '+0',
      'DALL-E 3': '+30',
      'DALL-E 3 HD': '+90',
    },
    quality: {
      '256 x 256': '+20',
      '512 x 512': '+25',
      '1024 x 1024': '+30',
      '1024 x 1792': '+90',
      '1792 x 1024': '+90',
    },
  },
} as const;

const getRuleOptions = (toolId: AITool, field: 'model' | 'quality' | 'duration') => {
  const options = TOOL_COIN_RULES[toolId][field];
  return options ? Object.keys(options) : [];
};

const QUALITY_OPTIONS_BY_MODEL: Partial<Record<AITool, Record<string, string[]>>> = {
  sora: {
    'Sora 2': ['720 x 1280', '1280 x 720'],
    'Sora 2 Pro': ['720 x 1280', '1280 x 720', '1024 x 1792', '1792 x 1024'],
  },
  dalle: {
    'DALL-E 2': ['256 x 256', '512 x 512', '1024 x 1024'],
    'DALL-E 3': ['1024 x 1024', '1024 x 1792', '1792 x 1024'],
    'DALL-E 3 HD': ['1024 x 1024', '1024 x 1792', '1792 x 1024'],
  },
};

export function AIToolsList({ tools, selectedTools, onToggleTool, onCoinsUpdate }: AIToolsListProps) {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<AITool | null>(null);

  const [selectedModel, setSelectedModel] = useState<Record<AITool, string>>({} as Record<AITool, string>);
  const [prompts, setPrompts] = useState<Record<AITool, string>>({} as Record<AITool, string>);
  const [selectedQuality, setSelectedQuality] = useState<Record<AITool, string>>({} as Record<AITool, string>);
  const [selectedDuration, setSelectedDuration] = useState<Record<AITool, string>>({} as Record<AITool, string>);

  const getModelsForTool = (toolId: AITool) => {
    return getRuleOptions(toolId, 'model');
  };

  const getQualitiesForTool = (toolId: AITool, model?: string) => {
    const modelValue = model ?? getSelectedModel(toolId);
    const mappedOptions = QUALITY_OPTIONS_BY_MODEL[toolId]?.[modelValue];
    if (mappedOptions) return mappedOptions;
    return getRuleOptions(toolId, 'quality');
  };

  const getDurationsForTool = (toolId: AITool) => {
    return getRuleOptions(toolId, 'duration');
  };

  const getSelectedModel = (toolId: AITool) => {
    const options = getModelsForTool(toolId);
    const value = selectedModel[toolId];
    return value && options.includes(value) ? value : options[0] ?? '';
  };

  const getSelectedQuality = (toolId: AITool, options: readonly string[]) => {
    const value = selectedQuality[toolId];
    return value && options.includes(value) ? value : options[0] ?? '';
  };

  const getSelectedDuration = (toolId: AITool, options: readonly string[]) => {
    const value = selectedDuration[toolId];
    return value && options.includes(value) ? value : options[0] ?? '';
  };

  const coinsByTool = useMemo<Record<AITool, number>>(() => {
    const getSelectedModelLocal = (toolId: AITool) => {
      const options = getRuleOptions(toolId, 'model');
      const value = selectedModel[toolId];
      return value && options.includes(value) ? value : options[0] ?? '';
    };

    const getSelectedQualityLocal = (toolId: AITool, options: readonly string[]) => {
      const value = selectedQuality[toolId];
      return value && options.includes(value) ? value : options[0] ?? '';
    };

    const getSelectedDurationLocal = (toolId: AITool, options: readonly string[]) => {
      const value = selectedDuration[toolId];
      return value && options.includes(value) ? value : options[0] ?? '';
    };

    const getQualitiesForToolLocal = (toolId: AITool, model?: string) => {
      const modelValue = model ?? getSelectedModelLocal(toolId);
      const mappedOptions = QUALITY_OPTIONS_BY_MODEL[toolId]?.[modelValue];
      if (mappedOptions) return mappedOptions;
      return getRuleOptions(toolId, 'quality');
    };

    const getDurationsForToolLocal = (toolId: AITool) => getRuleOptions(toolId, 'duration');

    const computeToolCoins = (toolId: AITool) => {
      const rules = TOOL_COIN_RULES[toolId];
      const formulas: CoinFormula[] = [];

      const modelFormula = rules.model?.[getSelectedModelLocal(toolId)];
      if (modelFormula) formulas.push(modelFormula);

      if (toolId === 'sora') {
        const qualityFormula = rules.quality?.[getSelectedQualityLocal('sora', getQualitiesForToolLocal('sora'))];
        const durationFormula = rules.duration?.[getSelectedDurationLocal('sora', getDurationsForToolLocal('sora'))];
        if (qualityFormula) formulas.push(qualityFormula);
        if (durationFormula) formulas.push(durationFormula);
      }

      if (toolId === 'dalle') {
        const qualityFormula = rules.quality?.[getSelectedQualityLocal('dalle', getQualitiesForToolLocal('dalle'))];
        if (qualityFormula) formulas.push(qualityFormula);
      }

      let addedCoins = 0;
      let multiplier = 1;

      formulas.forEach(formula => {
        if (formula.startsWith('+')) {
          addedCoins += Number(formula.slice(1));
          return;
        }
        multiplier *= Number(formula.slice(1));
      });

      return Math.max(0, Math.round(addedCoins * multiplier));
    };

    return {
      chatgpt: computeToolCoins('chatgpt'),
      sora: computeToolCoins('sora'),
      dalle: computeToolCoins('dalle'),
    };
  }, [selectedModel, selectedQuality, selectedDuration]);

  const totalSelectedCoins = useMemo(
    () => selectedTools.reduce((sum, toolId) => sum + (coinsByTool[toolId] ?? 0), 0),
    [selectedTools, coinsByTool],
  );

  useEffect(() => {
    onCoinsUpdate(coinsByTool, totalSelectedCoins);
  }, [coinsByTool, totalSelectedCoins, onCoinsUpdate]);

  const openSettings = (toolId: AITool) => {
    const models = getModelsForTool(toolId);
    const currentModel = selectedModel[toolId];
    const nextModel = currentModel && models.includes(currentModel) ? currentModel : models[0] ?? '';

    setSelectedModel(prev => ({
      ...prev,
      [toolId]: nextModel,
    }));

    if (toolId === 'sora') {
      const soraQualities = getQualitiesForTool('sora', nextModel);
      const soraDurations = getDurationsForTool('sora');
      setSelectedQuality(prev => ({
        ...prev,
        [toolId]:
          prev[toolId] && soraQualities.includes(prev[toolId]) ? prev[toolId] : soraQualities[0] ?? '',
      }));
      setSelectedDuration(prev => ({
        ...prev,
        [toolId]:
          prev[toolId] && soraDurations.includes(prev[toolId]) ? prev[toolId] : soraDurations[0] ?? '',
      }));
    }
    if (toolId === 'dalle') {
      const dalleQualities = getQualitiesForTool('dalle', nextModel);
      setSelectedQuality(prev => ({
        ...prev,
        [toolId]:
          prev[toolId] && dalleQualities.includes(prev[toolId]) ? prev[toolId] : dalleQualities[0] ?? '',
      }));
    }
    setActiveTool(toolId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTool(null);
  };

  const getToolIcon = (toolId: AITool): JSX.Element | null => {
    switch (toolId) {
      case 'chatgpt':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>
          </div>
        );
      case 'sora':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="2" y1="7" x2="7" y2="7"/>
              <line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="17" x2="22" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/>
            </svg>
          </div>
        );
      case 'dalle':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="8" r="3" />
              <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">

      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {t("neurallist-title")}
        </h2>
      </div>

      <div className="p-2 space-y-1">

        {tools.map(tool => {
          const selected = selectedTools.includes(tool.id);
          const displayedModel = getSelectedModel(tool.id);

          return (
            <div
              key={tool.id}
              className={`w-full group rounded-md border transition-all duration-200 cursor-pointer ${
                selected
                  ? 'bg-blue-100 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm'
                  : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
              onClick={() => onToggleTool(tool.id)}
            >
              <div className="px-2.5 py-2 flex items-center gap-2.5 justify-start">

                {getToolIcon(tool.id)}

                <div className="flex flex-1 items-center justify-between min-w-0">

                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {tool.name}
                    </div>

                    {displayedModel && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate transition-opacity">
                        {displayedModel}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSettings(tool.id);
                    }}
                    className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                </div>
              </div>
            </div>
          );
        })}

      </div>
      
      {isModalOpen && activeTool === 'chatgpt' && (
        <ChatgptModal
          heading={tools.find(t => t.id === 'chatgpt')?.name ?? 'ChatGPT'}
          models={getModelsForTool('chatgpt')}
          selectedModel={getSelectedModel('chatgpt')}
          onModelChange={value =>
            setSelectedModel(prev => ({
              ...prev,
              chatgpt: value,
            }))
          }
          coins={coinsByTool.chatgpt}
          prompt={prompts.chatgpt ?? ''}
          onPromptChange={value =>
            setPrompts(prev => ({
              ...prev,
              chatgpt: value,
            }))
          }
          onClose={closeModal}
        />
      )}

      {isModalOpen && activeTool === 'sora' && (
        <SoraModal
          heading={tools.find(t => t.id === 'sora')?.name ?? 'Sora'}
          models={getModelsForTool('sora')}
          selectedModel={getSelectedModel('sora')}
          onModelChange={value => {
            const soraQualities = getQualitiesForTool('sora', value);
            setSelectedModel(prev => ({
              ...prev,
              sora: value,
            }));
            setSelectedQuality(prev => ({
              ...prev,
              sora:
                prev.sora && soraQualities.includes(prev.sora)
                  ? prev.sora
                  : soraQualities[0] ?? '',
            }));
          }}
          qualities={getQualitiesForTool('sora', getSelectedModel('sora'))}
          selectedQuality={getSelectedQuality('sora', getQualitiesForTool('sora', getSelectedModel('sora')))}
          onQualityChange={value =>
            setSelectedQuality(prev => ({
              ...prev,
              sora: value,
            }))
          }
          durations={getDurationsForTool('sora')}
          selectedDuration={getSelectedDuration('sora', getDurationsForTool('sora'))}
          onDurationChange={value =>
            setSelectedDuration(prev => ({
              ...prev,
              sora: value,
            }))
          }
          coins={coinsByTool.sora}
          prompt={prompts.sora ?? ''}
          onPromptChange={value =>
            setPrompts(prev => ({
              ...prev,
              sora: value,
            }))
          }
          onClose={closeModal}
        />
      )}

      {isModalOpen && activeTool === 'dalle' && (
        <DalleModal
          heading={tools.find(t => t.id === 'dalle')?.name ?? 'DALL-E'}
          models={getModelsForTool('dalle')}
          selectedModel={getSelectedModel('dalle')}
          onModelChange={value => {
            const dalleQualities = getQualitiesForTool('dalle', value);
            setSelectedModel(prev => ({
              ...prev,
              dalle: value,
            }));
            setSelectedQuality(prev => ({
              ...prev,
              dalle:
                prev.dalle && dalleQualities.includes(prev.dalle)
                  ? prev.dalle
                  : dalleQualities[0] ?? '',
            }));
          }}
          qualities={getQualitiesForTool('dalle', getSelectedModel('dalle'))}
          selectedQuality={getSelectedQuality('dalle', getQualitiesForTool('dalle', getSelectedModel('dalle')))}
          onQualityChange={value =>
            setSelectedQuality(prev => ({
              ...prev,
              dalle: value,
            }))
          }
          coins={coinsByTool.dalle}
          prompt={prompts.dalle ?? ''}
          onPromptChange={value =>
            setPrompts(prev => ({
              ...prev,
              dalle: value,
            }))
          }
          onClose={closeModal}
        />
      )}
    </div>
  );
}


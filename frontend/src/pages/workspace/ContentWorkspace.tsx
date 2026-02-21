import { AIToolsList } from './NeuaralList';
import { ContentComposer } from './ContentPrompt';
import { SocialNetworks } from './SocialList';
import type { AITool, AIToolConfig, SocialPlatform, SocialConnection } from '../../App';
import useIsMounted from '../../hooks/useIsMounted';

interface ContentWorkspaceProps {
  aiTools: AIToolConfig[];
  socialNetworks: SocialConnection[];
  selectedTools: AITool[];
  selectedPlatforms: SocialPlatform[];
  coinBalance: number;
  selectedToolsCoins: number;

  onToggleTool: (tool: AITool) => void;
  onTogglePlatform: (platform: SocialPlatform) => void;
  onCoinsUpdate: (coinsByTool: Record<AITool, number>, total: number) => void;
  onSavePost: (content: any, status: 'generated' | 'sent') => void;
  onSpendCoins: (coins: number) => void;
}

export const ContentWorkspace = ({
  aiTools,
  socialNetworks,
  selectedTools,
  selectedPlatforms,
  coinBalance,
  selectedToolsCoins,
  onToggleTool,
  onTogglePlatform,
  onCoinsUpdate,
  onSavePost,
  onSpendCoins,
}: ContentWorkspaceProps) => {
  const isMounted = useIsMounted();

  return (
    <div className={`flex-1 flex overflow-hidden ${isMounted ? '' : 'not-mounted'}`}>
      {/* AI Tools - Left Panel */}
      <AIToolsList
        tools={aiTools}
        selectedTools={selectedTools}
        onToggleTool={onToggleTool}
        onCoinsUpdate={onCoinsUpdate}
      />

      {/* Center Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ContentComposer
          selectedTools={selectedTools}
          selectedPlatforms={selectedPlatforms}
          aiTools={aiTools}
          coinBalance={coinBalance}
          selectedToolsCoins={selectedToolsCoins}
          onSavePost={onSavePost}
          onSpendCoins={onSpendCoins}
        />
      </div>

      {/* Social Networks - Right Panel */}
      <SocialNetworks
        networks={socialNetworks}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={onTogglePlatform}
      />
    </div>
  );
};

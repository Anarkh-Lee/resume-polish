import { useState, useEffect } from "react";
import { Settings, Check, ExternalLink, Gift, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { trackSettingsOpen, trackAPIConfig } from "@/utils/analytics";

export type AIProvider = 'free' | 'openai' | 'custom';

interface AISettings {
  provider: AIProvider;
  openaiKey?: string;
  openaiModel?: string;
  customUrl?: string;
  customKey?: string;
  customModel?: string;
}

export interface UsageInfo {
  usageCount: number;
  remaining: number;
  isFree: boolean;
}

const STORAGE_KEY = 'ai-settings';
const DEVICE_ID_KEY = 'device-id';
const FREE_USAGE_LIMIT = 50;

// 获取或生成设备 ID
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getAISettings(): AISettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded AI settings:', parsed);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load AI settings:', e);
  }
  return { provider: 'free' };
}

export function resetAISettings() {
  localStorage.removeItem(STORAGE_KEY);
}

interface SettingsDialogProps {
  usageInfo?: UsageInfo | null;
}

export function SettingsDialog({ usageInfo }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>({ provider: 'free' });

  useEffect(() => {
    const loaded = getAISettings();
    setSettings(loaded);
  }, [open]);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('设置已保存');
      setOpen(false);
    } catch (e) {
      toast.error('保存失败');
    }
  };

  const usagePercent = usageInfo ? (usageInfo.usageCount / FREE_USAGE_LIMIT) * 100 : 0;
  const isNearLimit = usageInfo && usageInfo.remaining <= 10;
  const isExhausted = usageInfo && usageInfo.remaining <= 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        trackSettingsOpen();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Settings className="h-4 w-4" />
          {isNearLimit && !isExhausted && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full" />
          )}
          {isExhausted && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">AI 模型设置</DialogTitle>
          <DialogDescription>
            选择 AI 服务提供商并配置 API 密钥
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 免费额度显示 */}
          {settings.provider === 'free' && usageInfo && (
            <div className={`p-3 rounded-lg border ${isExhausted ? 'bg-destructive/10 border-destructive/30' : isNearLimit ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-primary/10 border-primary/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isExhausted ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Gift className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {isExhausted ? '免费次数已用完' : '免费使用额度'}
                  </span>
                </div>
                <span className="text-sm font-mono">
                  {usageInfo.usageCount}/{FREE_USAGE_LIMIT}
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {isExhausted 
                  ? '请切换到自定义 API 继续使用'
                  : `剩余 ${usageInfo.remaining} 次免费使用`
                }
              </p>
            </div>
          )}

          <RadioGroup
            value={settings.provider}
            onValueChange={(v) => {
              setSettings({ ...settings, provider: v as AIProvider });
              trackAPIConfig(v);
            }}
            className="space-y-3"
          >
            {/* 免费内置服务 */}
            <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${isExhausted ? 'border-border/50 opacity-60' : 'border-border hover:border-primary/50'}`}>
              <RadioGroupItem value="free" id="free" className="mt-1" disabled={isExhausted} />
              <Label htmlFor="free" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  免费服务
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    推荐
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  内置 AI 服务，无需配置，每位用户可免费使用 {FREE_USAGE_LIMIT} 次
                </p>
              </Label>
              {settings.provider === 'free' && (
                <Check className="h-4 w-4 text-primary mt-1" />
              )}
            </div>

            {/* OpenAI */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <RadioGroupItem value="openai" id="openai" className="mt-1" />
              <Label htmlFor="openai" className="flex-1 cursor-pointer">
                <div className="font-medium">OpenAI</div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用 OpenAI GPT 系列模型
                </p>
              </Label>
              {settings.provider === 'openai' && (
                <Check className="h-4 w-4 text-primary mt-1" />
              )}
            </div>

            {/* Custom */}
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <Label htmlFor="custom" className="flex-1 cursor-pointer">
                <div className="font-medium">自定义 API</div>
                <p className="text-xs text-muted-foreground mt-1">
                  兼容 OpenAI 格式的任意 API（如硅基流动、DeepSeek 等）
                </p>
              </Label>
              {settings.provider === 'custom' && (
                <Check className="h-4 w-4 text-primary mt-1" />
              )}
            </div>
          </RadioGroup>

          {/* OpenAI Settings */}
          {settings.provider === 'openai' && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-sm">API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiKey || ''}
                  onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="openai-model" className="text-sm">模型名称 (可选)</Label>
                <Input
                  id="openai-model"
                  placeholder="gpt-4o-mini"
                  value={settings.openaiModel || ''}
                  onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                获取 OpenAI API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Custom API Settings */}
          {settings.provider === 'custom' && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-2">
                <Label htmlFor="custom-url" className="text-sm">API URL</Label>
                <Input
                  id="custom-url"
                  placeholder="https://api.siliconflow.cn/v1"
                  value={settings.customUrl || ''}
                  onChange={(e) => setSettings({ ...settings, customUrl: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-key" className="text-sm">API Key</Label>
                <Input
                  id="custom-key"
                  type="password"
                  placeholder="your-api-key"
                  value={settings.customKey || ''}
                  onChange={(e) => setSettings({ ...settings, customKey: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-model" className="text-sm">模型名称</Label>
                <Input
                  id="custom-model"
                  placeholder="Qwen/Qwen2.5-7B-Instruct"
                  value={settings.customModel || ''}
                  onChange={(e) => setSettings({ ...settings, customModel: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                支持所有兼容 OpenAI Chat Completions 格式的 API
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSettings({ provider: 'free' });
              localStorage.removeItem(STORAGE_KEY);
              toast.success('已重置为默认设置');
            }}
            className="text-muted-foreground"
          >
            重置
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存设置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

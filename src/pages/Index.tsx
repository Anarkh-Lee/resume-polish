import { useState } from "react";
import { Sparkles, Terminal, Zap, AlertCircle, Gift, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/ResultCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { SettingsDialog, getAISettings, getDeviceId, UsageInfo } from "@/components/SettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PolishedResult {
  standard: string;
  datadriven: string;
  expert: string;
}

// Pre-filled example
const EXAMPLE_INPUT = "我在项目中使用了 Redis 缓存。";
const EXAMPLE_RESULTS: PolishedResult = {
  standard: "设计并实施 Redis 缓存策略，有效减轻数据库负载，提升系统整体响应效率。",
  datadriven: "引入 Redis 多级缓存架构，将核心接口 QPS 提升了 [X]%，平均响应时间从 [Y]ms 降低至 [Z]ms，显著优化用户体验。",
  expert: "主导高并发场景下的缓存架构升级，通过 Redis Cluster 解决缓存击穿、穿透与雪崩问题，设计热点数据预加载机制，成功支撑百万级日活用户的稳定访问。",
};

const FREE_USAGE_LIMIT = 50;

export default function Index() {
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [results, setResults] = useState<PolishedResult | null>(EXAMPLE_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

  const handlePolish = async () => {
    if (!input.trim()) {
      toast.error("请输入工作描述");
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const settings = getAISettings();
      const deviceId = getDeviceId();
      
      const { data, error: functionError } = await supabase.functions.invoke('polish-resume', {
        body: { 
          input: input.trim(),
          provider: settings.provider,
          deviceId,
          // Pass custom settings if needed
          ...(settings.provider === 'openai' && {
            apiKey: settings.openaiKey,
            model: settings.openaiModel,
          }),
          ...(settings.provider === 'custom' && {
            apiUrl: settings.customUrl,
            apiKey: settings.customKey,
            model: settings.customModel,
          }),
        }
      });

      if (functionError) {
        throw new Error(functionError.message || '请求失败');
      }

      if (data.error) {
        // 更新使用信息（即使出错也可能返回）
        if (data.usageInfo) {
          setUsageInfo(data.usageInfo);
        }
        throw new Error(data.error);
      }

      // 更新使用信息
      if (data.usageInfo) {
        setUsageInfo(data.usageInfo);
      }

      setResults({
        standard: data.standard || '',
        datadriven: data.datadriven || '',
        expert: data.expert || ''
      });
      
      toast.success("润色完成！");
    } catch (err) {
      console.error('Polish error:', err);
      const errorMessage = err instanceof Error ? err.message : '服务暂时不可用，请稍后再试';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const settings = getAISettings();
  const isFreeProvider = settings.provider === 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-mono font-bold text-lg text-foreground">
                  Resume<span className="text-primary">.polish()</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  程序员简历亮点润色神器
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 使用次数提示 */}
              {isFreeProvider && usageInfo && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  <Gift className="h-3 w-3 text-primary" />
                  <span>{usageInfo.remaining}/{FREE_USAGE_LIMIT}</span>
                </div>
              )}
              <SettingsDialog usageInfo={usageInfo} />
              <a
                href="https://github.com/Anarkh-Lee/resume-polish"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                title="View on GitHub"
              >
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-primary">//</span>
            <span>输入你的大白话描述，让 AI 帮你润色成专业简历话术</span>
          </div>
          
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的大白话描述，例如：'我修复了支付模块的一个Bug'..."
              className="w-full h-32 p-4 font-mono text-sm bg-input border border-border rounded-lg 
                         placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 
                         focus:ring-primary/50 focus:border-primary/50 resize-none transition-all"
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground font-mono">
              {input.length} chars
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              variant="glow"
              size="lg"
              onClick={handlePolish}
              disabled={isLoading || !input.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Zap className="h-5 w-5 animate-pulse" />
                  AI 正在思考...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  AI 智能润色
                </>
              )}
            </Button>
            
            {/* 移动端使用次数提示 */}
            {isFreeProvider && usageInfo && (
              <div className="sm:hidden flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Gift className="h-3 w-3 text-primary" />
                <span>免费剩余 {usageInfo.remaining} 次</span>
              </div>
            )}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-primary">//</span>
            <span>润色结果 - 三个版本供你选择</span>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : results ? (
            <div className="space-y-4">
              <ResultCard
                version="A"
                title="标准专业版"
                subtitle="语言简练、用词专业"
                content={results.standard}
                delay={0}
              />
              <ResultCard
                version="B"
                title="数据驱动版"
                subtitle="强调量化成果 · 请补充 [数据]"
                content={results.datadriven}
                delay={100}
              />
              <ResultCard
                version="C"
                title="专家/架构师版"
                subtitle="技术深度 · 商业价值 · 影响力"
                content={results.expert}
                delay={200}
              />
            </div>
          ) : null}
        </section>

        {/* Tips Section */}
        <section className="border border-border/50 rounded-lg p-4 bg-card/30">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10 border border-primary/20 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Pro Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 使用强动词开头：重构、主导、设计、优化、推动</li>
                <li>• 包含技术关键词：Redis, Kubernetes, 微服务, 分布式</li>
                <li>• 补充真实数据：将 [X]% 替换为你的实际成果</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground font-mono">
            Built for developers, by Anarkh-Lee 🚀
          </p>
        </div>
      </footer>
    </div>
  );
}

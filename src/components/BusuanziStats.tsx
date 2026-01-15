import { useEffect, useState } from 'react';
import { Eye, Users } from 'lucide-react';

declare global {
  interface Window {
    busuanzi?: {
      fetch: () => void;
    };
  }
}

export const BusuanziStats = () => {
  const [stats, setStats] = useState({ pv: '--', uv: '--' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 50; // 最多检查5秒

    const updateStats = () => {
      const pvElement = document.getElementById('busuanzi_value_site_pv');
      const uvElement = document.getElementById('busuanzi_value_site_uv');
      
      if (pvElement && uvElement) {
        const pvValue = pvElement.textContent || '--';
        const uvValue = uvElement.textContent || '--';
        
        // 只有当值不是初始值时才更新
        if (pvValue !== '--' || uvValue !== '--') {
          setStats({ pv: pvValue, uv: uvValue });
          setIsVisible(true);
        }
      }
    };

    // 先显示组件框架
    setIsVisible(true);

    // 定期检查不蒜子是否已加载数据
    const checkInterval = setInterval(() => {
      checkCount++;
      
      // 检查 DOM 元素是否有值
      updateStats();
      
      // 达到最大检查次数后停止
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        console.log('不蒜子统计检查完成');
      }
    }, 100);

    // 监听不蒜子脚本加载
    const handleLoad = () => {
      setTimeout(updateStats, 500);
    };

    window.addEventListener('load', handleLoad);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // 总是显示组件，即使数据还没加载
  return (
    <div className={`flex items-center justify-center gap-4 text-xs text-muted-foreground font-mono transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" />
        <span>访问量</span>
        <span 
          id="busuanzi_value_site_pv" 
          className="font-semibold text-foreground min-w-[2rem] text-center"
        >
          {stats.pv}
        </span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" />
        <span>访客数</span>
        <span 
          id="busuanzi_value_site_uv" 
          className="font-semibold text-foreground min-w-[2rem] text-center"
        >
          {stats.uv}
        </span>
      </div>
    </div>
  );
};

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gtagOptions: {
        send_page_view: false, // 手动控制页面浏览
      },
    });
  }
};

export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// 业务专用事件
export const trackPolishRequest = (provider: string) => {
  trackEvent('Resume', 'Polish Request', provider);
};

export const trackCopyResult = (version: string) => {
  trackEvent('Resume', 'Copy Result', version);
};

export const trackSettingsOpen = () => {
  trackEvent('Settings', 'Open Dialog');
};

export const trackAPIConfig = (provider: string) => {
  trackEvent('Settings', 'Configure API', provider);
};

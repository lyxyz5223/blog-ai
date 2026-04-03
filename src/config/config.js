// 配置管理模块 - 从环境变量读取
let config = null;

export const loadConfig = async () => {
  if (config) return config;

  // 从环境变量读取配置
  config = {
    useLocalStorage: import.meta.env.VITE_USE_LOCAL_STORAGE === 'true',
    apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5000/api'
  };

  return config;
};

export const getConfig = () => {
  if (!config) {
    loadConfig();
  }
  return config;
};

export const updateConfig = (newConfig) => {
  config = newConfig;
  // 保存到本地存储用于前端临时使用
  localStorage.setItem('blog-config', JSON.stringify(newConfig));
};

export const isUsingLocalStorage = () => {
  const currentConfig = getConfig();
  return currentConfig?.useLocalStorage ?? false;
};

export const getApiEndpoint = () => {
  const currentConfig = getConfig();
  return currentConfig.apiEndpoint;
};

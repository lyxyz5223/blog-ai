import { useEffect, useState } from 'react';
import '../styles/FloatingMusicPlayer.css';

const APLAYER_CSS = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
const APLAYER_JS = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
const METING_JS = 'https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js';

function ensureStyle(href, id) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function ensureScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`load failed: ${src}`));
    document.body.appendChild(script);
  });
}

function clickPlayButton() {
  const byClass = document.getElementsByClassName('aplayer-button aplayer-play')[0];
  if (byClass) {
    byClass.click();
    return true;
  }

  const fallback = document.querySelector('.aplayer .aplayer-icon-play');
  if (fallback) {
    fallback.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }
  return false;
}

export default function FloatingMusicPlayer() {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        ensureStyle(APLAYER_CSS, 'aplayer-css-cdn');
        await ensureScript(APLAYER_JS, 'aplayer-js-cdn');
        await ensureScript(METING_JS, 'meting-js-cdn');
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setLoadError('在线音乐组件加载失败，请检查网络或稍后重试。');
        }
      }
    }

    setup();

    const onFirstClick = () => {
      setTimeout(() => {
        clickPlayButton();
      }, 0);
      window.removeEventListener('click', onFirstClick);
    };

    window.addEventListener('click', onFirstClick);

    return () => {
      cancelled = true;
      window.removeEventListener('click', onFirstClick);
    };
  }, []);

  if (loadError) {
    return <div className="music-load-error">{loadError}</div>;
  }

  if (!ready) {
    return <div className="music-loading">在线音乐加载中...</div>;
  }

  return (
    <div className="music-meting-wrapper">
      <meting-js
        server="netease"
        type="playlist"
        id="3187202798"
        fixed="true"
        autoplay="true"
        loop="all"
        order="random"
        preload="auto"
        list-folded="true"
        list-max-height="500px"
        lrc-type="1"
      />
    </div>
  );
}

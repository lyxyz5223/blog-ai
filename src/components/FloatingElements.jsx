import { useEffect, useRef, useState } from 'react';
import '../styles/FloatingElements.css';

export default function FloatingElements() {
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const elementRefs = useRef([]);
  const [shapes, setShapes] = useState([]);
  const rafId = useRef(null);
  const lastUpdateTime = useRef(0);

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  // 每次刷新生成不同数量/大小/位置的形状
  const generateRandomShapes = () => {
    const colors = ['#FF6B9D', '#FFA500', '#FFD700', '#00CEC9', '#74B9FF', '#A29BFE', '#6C5CE7'];
    const types = ['circle', 'square', 'triangle'];
    const isMobile = window.innerWidth <= 768;
    const count = Math.floor(randomInRange(6, 12));

    return Array.from({ length: count }, (_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const size = isMobile ? randomInRange(60, 150) : randomInRange(90, 240);
      const depth = randomInRange(-80, 120);

      return {
        id: `${Date.now()}-${index}`,
        type,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: `${randomInRange(5, 92)}vw`,
        top: `${randomInRange(5, 92)}vh`,
        size,
        opacity: randomInRange(0.35, 0.55),
        duration: randomInRange(7, 13),
        delay: randomInRange(0, 3),
        swayDuration: randomInRange(4, 8),
        driftX: randomInRange(6, 16),
        driftY: randomInRange(14, 28),
        liftZ: randomInRange(14, 42),
        tiltX: randomInRange(3, 10),
        tiltY: randomInRange(4, 12),
        depth,
        zIndex: Math.round(120 + depth)
      };
    });
  };

  // 使用 requestAnimationFrame 优化鼠标跟随动画
  const updateElementsPosition = () => {
    if (!containerRef.current || elementRefs.current.length === 0) return;

    elementRefs.current.forEach((el) => {
      if (!el) return;
      const depth = Number(el.dataset.depth || 0);
      const depthFactor = Math.min(1, Math.max(0, (depth + 100) / 240));
      const speed = 0.01 + depthFactor * 0.04;
      const x = (window.innerWidth / 2 - mousePos.current.x) * speed;
      const y = (window.innerHeight / 2 - mousePos.current.y) * speed;
      
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    setShapes(generateRandomShapes());

    // 处理鼠标移动 - 使用节流
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY
      };

      // 取消之前的帧
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      // 使用 requestAnimationFrame 来批量更新
      rafId.current = requestAnimationFrame(() => {
        updateElementsPosition();
        rafId.current = null;
      });
    };

    // 处理多样化点击效果
    const handleClick = (e) => {
      // 涟漪效果1 - 渐扩圆圈
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple ripple-expand';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);

      // 涟漪效果2 - 彩色粒子
      createParticles(e.clientX, e.clientY);

      // 涟漪效果3 - 脉冲圆
      const pulse = document.createElement('span');
      pulse.className = 'click-ripple ripple-pulse';
      pulse.style.left = e.clientX + 'px';
      pulse.style.top = e.clientY + 'px';
      document.body.appendChild(pulse);

      setTimeout(() => ripple.remove(), 600);
      setTimeout(() => pulse.remove(), 800);
    };

    // 创建彩色粒子效果
    const createParticles = (x, y) => {
      const particleCount = 8;
      const colors = ['#FF6B9D', '#FFA500', '#FFD700', '#00CEC9', '#74B9FF'];
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 3;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.setProperty('--vx', Math.cos(angle) * velocity);
        particle.style.setProperty('--vy', Math.sin(angle) * velocity);
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      // 清理 RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // 在形状更新时，更新 elementRefs
  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll('.floating-element');
    elementRefs.current = Array.from(elements || []);
  }, [shapes]);

  return (
    <div className="floating-container" ref={containerRef}>
      {shapes.map((shape) => {
        const triangleHalf = shape.size * 0.5;
        const triangleHeight = shape.size * 0.85;

        return (
          <div
            key={shape.id}
            className="floating-element"
            data-depth={shape.depth}
            style={{
              left: shape.left,
              top: shape.top,
              opacity: shape.opacity,
              '--depth': `${shape.depth}px`,
              zIndex: shape.zIndex
            }}
          >
            <div
              className={`floating-shape shape-${shape.type}`}
              style={{
                '--color': shape.color,
                '--float-duration': `${shape.duration}s`,
                '--float-delay': `${shape.delay}s`,
                '--sway-duration': `${shape.swayDuration}s`,
                '--drift-x': `${shape.driftX}px`,
                '--drift-y': `${shape.driftY}px`,
                '--lift-z': `${shape.liftZ}px`,
                '--tilt-x': `${shape.tiltX}deg`,
                '--tilt-y': `${shape.tiltY}deg`,
                '--triangle-base': `${shape.size}px`,
                '--shadow-alpha': `${0.08 + ((shape.depth + 80) / 200) * 0.16}`,
                '--shadow-lift': `${8 + ((shape.depth + 80) / 200) * 18}px`,
                width: shape.type === 'triangle' ? 0 : `${shape.size}px`,
                height: shape.type === 'triangle' ? 0 : `${shape.size}px`,
                borderLeft: shape.type === 'triangle' ? `${triangleHalf}px solid transparent` : undefined,
                borderRight: shape.type === 'triangle' ? `${triangleHalf}px solid transparent` : undefined,
                borderBottom: shape.type === 'triangle' ? `${triangleHeight}px solid ${shape.color}` : undefined
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
}

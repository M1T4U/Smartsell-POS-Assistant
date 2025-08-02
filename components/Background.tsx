import React, { useRef, useEffect } from 'react';

const THEME_CONFIG = {
  light: {
    hexagonBorderColor: 'rgba(37, 99, 235, 0.4)',
    packetColor: 'rgba(37, 99, 235, 1)',
    packetGlowColor: 'rgba(96, 165, 250, 0.7)',
    glitterColors: [
      'rgba(37, 99, 235, 0.8)',
      'rgba(16, 185, 129, 0.7)',
      'rgba(139, 92, 246, 0.6)',
      'rgba(245, 158, 11, 0.7)',
      'rgba(236, 72, 153, 0.6)',
    ],
  },
  dark: {
    hexagonBorderColor: 'rgba(45, 212, 191, 0.5)',
    packetColor: 'rgba(52, 211, 153, 1)',
    packetGlowColor: 'rgba(167, 243, 208, 0.7)',
    glitterColors: [
      'rgba(100, 255, 218, 0.9)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(6, 182, 212, 0.8)',
      'rgba(147, 197, 253, 0.7)',
      'rgba(255, 255, 255, 0.6)',
    ],
  },
};

class HexNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  dRotation: number;
  opacity: number;
  dOpacity: number;
  maxOpacity: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.015;
    this.vy = (Math.random() - 0.5) * 0.015;
    this.size = Math.random() * 8 + 10;
    this.rotation = Math.random() * Math.PI * 2;
    this.dRotation = (Math.random() - 0.5) * 0.0005;
    this.opacity = Math.random() * 0.1;
    this.dOpacity = (Math.random() * 0.001) + 0.0005;
    this.maxOpacity = Math.random() * 0.4 + 0.4;
  }

  update(width: number, height: number) {
    this.x = (this.x + this.vx + width) % width;
    this.y = (this.y + this.vy + height) % height;
    this.rotation += this.dRotation;
    
    this.opacity += this.dOpacity;
    if (this.opacity > this.maxOpacity || this.opacity < 0.1) {
        this.dOpacity *= -1;
        // Clamp values to prevent over/undershooting
        this.opacity = Math.max(0.1, Math.min(this.maxOpacity, this.opacity));
    }
  }

  private drawHexagonPath(ctx: CanvasRenderingContext2D, size: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
    }
    ctx.closePath();
  }

  draw(ctx: CanvasRenderingContext2D, colors: any) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.globalAlpha = this.opacity;

    // Outer glow
    ctx.shadowColor = colors.hexagonBorderColor;
    ctx.shadowBlur = this.size / 2;

    // Main hexagon outline
    ctx.strokeStyle = colors.hexagonBorderColor;
    ctx.lineWidth = 1.5;
    this.drawHexagonPath(ctx, this.size);
    ctx.stroke();

    // Inner detail hexagon, with its own rotation for more dynamism
    ctx.rotate(this.rotation * -1.5); // Counter-rotation
    ctx.lineWidth = 0.5;
    this.drawHexagonPath(ctx, this.size * 0.5);
    ctx.stroke();
    
    // undo inner rotation
    ctx.rotate(-(this.rotation * -1.5)); 

    // Corner dots
    ctx.fillStyle = colors.packetGlowColor;
    ctx.shadowBlur = 4;
    ctx.shadowColor = colors.packetGlowColor;

    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const cornerX = this.size * Math.cos(angle);
        const cornerY = this.size * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(cornerX, cornerY, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }
}

class Packet {
  path: HexNode[];
  index: number;
  progress: number;

  constructor(nodes: HexNode[]) {
    this.path = [];
    this.index = 0;
    this.progress = 0;
    this.resetPath(nodes);
  }

  resetPath(nodes: HexNode[]) {
    if (nodes.length < 2) return;
    const pathLength = 2 + Math.floor(Math.random() * 3);
    this.path = Array.from({ length: pathLength }, () => nodes[Math.floor(Math.random() * nodes.length)]);
    this.index = 0;
    this.progress = 0;
  }

  update(nodes: HexNode[]) {
    this.progress += 0.002;
    if (this.progress >= 1) {
        this.index++;
        this.progress = 0;
        if (this.index >= this.path.length - 1) {
            this.resetPath(nodes);
        }
    }
  }

  draw(ctx: CanvasRenderingContext2D, colors: any) {
    const current = this.path[this.index];
    const next = this.path[this.index + 1];
    if (!current || !next) return;

    const x = current.x + (next.x - current.x) * this.progress;
    const y = current.y + (next.y - current.y) * this.progress;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = colors.packetColor;
    ctx.shadowColor = colors.packetGlowColor;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

class GlitterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  opacity: number;
  dOpacity: number;

  constructor(w: number, h: number, colors: string[]) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.01;
    this.vy = (Math.random() - 0.5) * 0.01;
    this.r = Math.random() * 1.2 + 0.3;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = Math.random() * 0.5;
    this.dOpacity = (Math.random() - 0.5) * 0.0025;
  }

  update(w: number, h: number) {
    this.x = (this.x + this.vx + w) % w;
    this.y = (this.y + this.vy + h) % h;
    this.opacity += this.dOpacity;
    if(this.opacity < 0 || this.opacity > 1) this.dOpacity *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

interface BackgroundProps {
  theme: 'light' | 'dark';
}

const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let nodes: HexNode[] = [];
    let packets: Packet[] = [];
    let glitter: GlitterParticle[] = [];

    const colors = THEME_CONFIG[theme];

    const setup = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const nodeCount = Math.max(12, Math.floor((width * height) / 50000));
      const packetCount = Math.floor(nodeCount * 1.2);
      const glitterCount = Math.floor((width * height) / 12000);

      nodes = Array.from({ length: nodeCount }, () => new HexNode(width, height));
      packets = Array.from({ length: packetCount }, () => new Packet(nodes));
      glitter = Array.from({ length: glitterCount }, () => new GlitterParticle(width, height, colors.glitterColors));
    };

    const animate = () => {
      if (!ctx || !width || !height) return;
      ctx.clearRect(0, 0, width, height);

      glitter.forEach(p => {
        p.update(width, height);
        p.draw(ctx);
      });

      nodes.forEach(n => {
        n.update(width, height);
        n.draw(ctx, colors);
      });

      packets.forEach(p => {
        p.update(nodes);
        p.draw(ctx, colors);
      });

      rafId.current = requestAnimationFrame(animate);
    };
    
    setup();
    animate();

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId.current);
      setup();
      animate();
    });

    if (canvas.parentElement) {
        observer.observe(canvas.parentElement);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, [theme]);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-zinc-900 dark:via-slate-900 dark:to-emerald-950 transition-all duration-500">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default Background;
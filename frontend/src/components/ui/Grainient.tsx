import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

interface GrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  className?: string;
}

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(-1.0 + 2.0 * hash(i), f), dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(-1.0 + 2.0 * hash(i + vec2(1.0)), f - vec2(1.0)), u.x),
    u.y
  ) * 0.5 + 0.5;
}

void main() {
  float t = iTime * uTimeSpeed;
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 p = uv - 0.5;
  p.y /= ratio;
  p *= Rot(radians((noise(vec2(t * 0.1, p.x * p.y) * 2.0) - 0.5) * 500.0 + 180.0));
  p.y *= ratio;

  p.x += sin(p.y * 5.0 + t * 2.0) / 38.0;
  p.y += sin(p.x * 7.5 + t * 2.0) / 20.0;

  float blendX = p.x;
  float edge0 = -0.62;
  float edge1 = 0.58;
  vec3 lower = mix(uColor3, uColor2, S(edge0, edge1, blendX));
  vec3 upper = mix(uColor2, uColor1, S(edge0, edge1, blendX));
  vec3 color = mix(lower, upper, S(0.72, -0.62, p.y));

  float grain = fract(sin(dot(uv * 2.0, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.055;
  color = (color - 0.5) * 1.25 + 0.5;
  color = clamp(color, 0.0, 1.0);
  fragColor = vec4(color, 1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  if (value.length !== 6) return [1, 1, 1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

export function Grainient({
  color1 = "#7266d6",
  color2 = "#4338a8",
  color3 = "#17143a",
  timeSpeed = 0.25,
  className = "",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.height = "100%";
    canvas.style.width = "100%";
    container.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: new Float32Array([1, 1]) },
        iTime: { value: 0 },
        uTimeSpeed: { value: timeSpeed },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
        uColor3: { value: new Float32Array(hexToRgb(color3)) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      const resolution = program.uniforms.iResolution.value as Float32Array;
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationFrame = 0;
    const startTime = performance.now();
    const render = (time: number) => {
      program.uniforms.iTime.value = (time - startTime) / 1000;
      renderer.render({ scene: mesh });
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color1, color2, color3, timeSpeed]);

  return <div ref={containerRef} aria-hidden="true" className={`absolute inset-0 ${className}`} />;
}

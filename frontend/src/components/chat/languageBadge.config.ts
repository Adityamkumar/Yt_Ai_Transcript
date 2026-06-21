import React from 'react';


export const CodeIcon = (props: React.SVGProps<SVGSVGElement>) =>
  React.createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      width: '14',
      height: '14',
      ...props,
    },
    React.createElement('polyline', { points: '16 18 22 12 16 6' }),
    React.createElement('polyline', { points: '8 6 2 12 8 18' })
  );

export const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) =>
  React.createElement(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      width: '14',
      height: '14',
      ...props,
    },
    React.createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }),
    React.createElement('path', { d: 'M3 5V19A9 3 0 0 0 21 19V5' }),
    React.createElement('path', { d: 'M3 12A9 3 0 0 0 21 12' })
  );

export interface LanguageConfig {
  iconType: 'devicon' | 'svg';
  icon: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  displayName: string;
  color: string;
}

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  c: { iconType: 'devicon', icon: 'devicon-c-plain', displayName: 'C', color: '#03599C' },
  cpp: { iconType: 'devicon', icon: 'devicon-cplusplus-plain', displayName: 'C++', color: '#00599C' },
  'c++': { iconType: 'devicon', icon: 'devicon-cplusplus-plain', displayName: 'C++', color: '#00599C' },
  csharp: { iconType: 'devicon', icon: 'devicon-csharp-plain', displayName: 'C#', color: '#9B4993' },
  'c#': { iconType: 'devicon', icon: 'devicon-csharp-plain', displayName: 'C#', color: '#9B4993' },
  java: { iconType: 'devicon', icon: 'devicon-java-plain', displayName: 'Java', color: '#E41F23' },
  javascript: { iconType: 'devicon', icon: 'devicon-javascript-plain', displayName: 'JavaScript', color: '#F7DF1E' },
  js: { iconType: 'devicon', icon: 'devicon-javascript-plain', displayName: 'JavaScript', color: '#F7DF1E' },
  typescript: { iconType: 'devicon', icon: 'devicon-typescript-plain', displayName: 'TypeScript', color: '#3178C6' },
  ts: { iconType: 'devicon', icon: 'devicon-typescript-plain', displayName: 'TypeScript', color: '#3178C6' },
  python: { iconType: 'devicon', icon: 'devicon-python-plain', displayName: 'Python', color: '#3776AB' },
  py: { iconType: 'devicon', icon: 'devicon-python-plain', displayName: 'Python', color: '#3776AB' },
  go: { iconType: 'devicon', icon: 'devicon-go-original', displayName: 'Go', color: '#00ADD8' },
  golang: { iconType: 'devicon', icon: 'devicon-go-original', displayName: 'Go', color: '#00ADD8' },
  rust: { iconType: 'devicon', icon: 'devicon-rust-plain', displayName: 'Rust', color: '#CE412B' },
  php: { iconType: 'devicon', icon: 'devicon-php-plain', displayName: 'PHP', color: '#777BB4' },
  ruby: { iconType: 'devicon', icon: 'devicon-ruby-plain', displayName: 'Ruby', color: '#701516' },
  swift: { iconType: 'devicon', icon: 'devicon-swift-plain', displayName: 'Swift', color: '#F05138' },
  kotlin: { iconType: 'devicon', icon: 'devicon-kotlin-plain', displayName: 'Kotlin', color: '#7F52FF' },
  sql: { iconType: 'svg', icon: DatabaseIcon, displayName: 'SQL', color: '#34D399' }, 
  bash: { iconType: 'devicon', icon: 'devicon-bash-plain', displayName: 'Bash', color: '#4EAA25' },
  sh: { iconType: 'devicon', icon: 'devicon-bash-plain', displayName: 'Bash', color: '#4EAA25' },
  shell: { iconType: 'devicon', icon: 'devicon-bash-plain', displayName: 'Shell', color: '#4EAA25' },
  zsh: { iconType: 'devicon', icon: 'devicon-bash-plain', displayName: 'Zsh', color: '#4EAA25' },
  json: { iconType: 'devicon', icon: 'devicon-json-plain', displayName: 'JSON', color: '#8b9cf7' },
  yaml: { iconType: 'devicon', icon: 'devicon-yaml-plain', displayName: 'YAML', color: '#b356a3' },
  yml: { iconType: 'devicon', icon: 'devicon-yaml-plain', displayName: 'YAML', color: '#b356a3' },
  html: { iconType: 'devicon', icon: 'devicon-html5-plain', displayName: 'HTML', color: '#E34F26' },
  css: { iconType: 'devicon', icon: 'devicon-css3-plain', displayName: 'CSS', color: '#1572B6' },
  scss: { iconType: 'devicon', icon: 'devicon-sass-original', displayName: 'SCSS', color: '#CC6699' },
  sass: { iconType: 'devicon', icon: 'devicon-sass-original', displayName: 'Sass', color: '#CC6699' },
  react: { iconType: 'devicon', icon: 'devicon-react-original', displayName: 'React', color: '#61DAFB' },
  jsx: { iconType: 'devicon', icon: 'devicon-react-original', displayName: 'React JSX', color: '#61DAFB' },
  tsx: { iconType: 'devicon', icon: 'devicon-react-original', displayName: 'React TSX', color: '#61DAFB' },
  typescriptreact: { iconType: 'devicon', icon: 'devicon-react-original', displayName: 'React TSX', color: '#61DAFB' },
  javascriptreact: { iconType: 'devicon', icon: 'devicon-react-original', displayName: 'React JSX', color: '#61DAFB' },
  node: { iconType: 'devicon', icon: 'devicon-nodejs-plain', displayName: 'Node.js', color: '#339933' },
  nodejs: { iconType: 'devicon', icon: 'devicon-nodejs-plain', displayName: 'Node.js', color: '#339933' },
  docker: { iconType: 'devicon', icon: 'devicon-docker-plain', displayName: 'Dockerfile', color: '#2496ED' },
  dockerfile: { iconType: 'devicon', icon: 'devicon-docker-plain', displayName: 'Dockerfile', color: '#2496ED' },
  markdown: { iconType: 'devicon', icon: 'devicon-markdown-original', displayName: 'Markdown', color: '#8b9cf7' },
  md: { iconType: 'devicon', icon: 'devicon-markdown-original', displayName: 'Markdown', color: '#8b9cf7' },
  kubernetes: { iconType: 'devicon', icon: 'devicon-kubernetes-plain', displayName: 'Kubernetes', color: '#326CE5' },
  k8s: { iconType: 'devicon', icon: 'devicon-kubernetes-plain', displayName: 'Kubernetes', color: '#326CE5' },
  mongodb: { iconType: 'devicon', icon: 'devicon-mongodb-plain', displayName: 'MongoDB', color: '#47A248' },
  mongo: { iconType: 'devicon', icon: 'devicon-mongodb-plain', displayName: 'MongoDB', color: '#47A248' },
};

export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  iconType: 'svg',
  icon: CodeIcon,
  displayName: 'Code',
  color: '#8b9cf7',
};

export function getLanguageConfig(langName: string): LanguageConfig {
  if (!langName) return DEFAULT_LANGUAGE_CONFIG;
  const normalized = langName.trim().toLowerCase();
  return (
    LANGUAGE_MAP[normalized] || {
      iconType: DEFAULT_LANGUAGE_CONFIG.iconType,
      icon: DEFAULT_LANGUAGE_CONFIG.icon,
      displayName: langName, 
      color: DEFAULT_LANGUAGE_CONFIG.color,
    }
  );
}

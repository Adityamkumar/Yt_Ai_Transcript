import React from 'react';
import cSvg from 'devicon/icons/c/c-original.svg?raw';
import cppSvg from 'devicon/icons/cplusplus/cplusplus-plain.svg?raw';
import csharpSvg from 'devicon/icons/csharp/csharp-plain.svg?raw';
import javaSvg from 'devicon/icons/java/java-plain.svg?raw';
import javascriptSvg from 'devicon/icons/javascript/javascript-plain.svg?raw';
import typescriptSvg from 'devicon/icons/typescript/typescript-plain.svg?raw';
import pythonSvg from 'devicon/icons/python/python-plain.svg?raw';
import goSvg from 'devicon/icons/go/go-original.svg?raw';
import rustSvg from 'devicon/icons/rust/rust-original.svg?raw';
import phpSvg from 'devicon/icons/php/php-plain.svg?raw';
import rubySvg from 'devicon/icons/ruby/ruby-plain.svg?raw';
import swiftSvg from 'devicon/icons/swift/swift-plain.svg?raw';
import kotlinSvg from 'devicon/icons/kotlin/kotlin-plain.svg?raw';
import bashSvg from 'devicon/icons/bash/bash-plain.svg?raw';
import jsonSvg from 'devicon/icons/json/json-plain.svg?raw';
import yamlSvg from 'devicon/icons/yaml/yaml-plain.svg?raw';
import htmlSvg from 'devicon/icons/html5/html5-plain.svg?raw';
import cssSvg from 'devicon/icons/css3/css3-plain.svg?raw';
import sassSvg from 'devicon/icons/sass/sass-original.svg?raw';
import reactSvg from 'devicon/icons/react/react-original.svg?raw';
import nodejsSvg from 'devicon/icons/nodejs/nodejs-plain.svg?raw';
import dockerSvg from 'devicon/icons/docker/docker-plain.svg?raw';
import markdownSvg from 'devicon/icons/markdown/markdown-original.svg?raw';
import kubernetesSvg from 'devicon/icons/kubernetes/kubernetes-plain.svg?raw';
import mongodbSvg from 'devicon/icons/mongodb/mongodb-plain.svg?raw';

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
  iconType: 'devicon' | 'svg' | 'svg-raw';
  icon: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  displayName: string;
  color: string;
}

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
  c: { iconType: 'svg-raw', icon: cSvg, displayName: 'C', color: '#03599C' },
  cpp: { iconType: 'svg-raw', icon: cppSvg, displayName: 'C++', color: '#00599C' },
  'c++': { iconType: 'svg-raw', icon: cppSvg, displayName: 'C++', color: '#00599C' },
  csharp: { iconType: 'svg-raw', icon: csharpSvg, displayName: 'C#', color: '#9B4993' },
  'c#': { iconType: 'svg-raw', icon: csharpSvg, displayName: 'C#', color: '#9B4993' },
  java: { iconType: 'svg-raw', icon: javaSvg, displayName: 'Java', color: '#E41F23' },
  javascript: { iconType: 'svg-raw', icon: javascriptSvg, displayName: 'JavaScript', color: '#F7DF1E' },
  js: { iconType: 'svg-raw', icon: javascriptSvg, displayName: 'JavaScript', color: '#F7DF1E' },
  typescript: { iconType: 'svg-raw', icon: typescriptSvg, displayName: 'TypeScript', color: '#3178C6' },
  ts: { iconType: 'svg-raw', icon: typescriptSvg, displayName: 'TypeScript', color: '#3178C6' },
  python: { iconType: 'svg-raw', icon: pythonSvg, displayName: 'Python', color: '#3776AB' },
  py: { iconType: 'svg-raw', icon: pythonSvg, displayName: 'Python', color: '#3776AB' },
  go: { iconType: 'svg-raw', icon: goSvg, displayName: 'Go', color: '#00ADD8' },
  golang: { iconType: 'svg-raw', icon: goSvg, displayName: 'Go', color: '#00ADD8' },
  rust: { iconType: 'svg-raw', icon: rustSvg, displayName: 'Rust', color: '#CE412B' },
  php: { iconType: 'svg-raw', icon: phpSvg, displayName: 'PHP', color: '#777BB4' },
  ruby: { iconType: 'svg-raw', icon: rubySvg, displayName: 'Ruby', color: '#701516' },
  swift: { iconType: 'svg-raw', icon: swiftSvg, displayName: 'Swift', color: '#F05138' },
  kotlin: { iconType: 'svg-raw', icon: kotlinSvg, displayName: 'Kotlin', color: '#7F52FF' },
  sql: { iconType: 'svg', icon: DatabaseIcon, displayName: 'SQL', color: '#34D399' }, 
  bash: { iconType: 'svg-raw', icon: bashSvg, displayName: 'Bash', color: '#4EAA25' },
  sh: { iconType: 'svg-raw', icon: bashSvg, displayName: 'Bash', color: '#4EAA25' },
  shell: { iconType: 'svg-raw', icon: bashSvg, displayName: 'Shell', color: '#4EAA25' },
  zsh: { iconType: 'svg-raw', icon: bashSvg, displayName: 'Zsh', color: '#4EAA25' },
  json: { iconType: 'svg-raw', icon: jsonSvg, displayName: 'JSON', color: '#8b9cf7' },
  yaml: { iconType: 'svg-raw', icon: yamlSvg, displayName: 'YAML', color: '#b356a3' },
  yml: { iconType: 'svg-raw', icon: yamlSvg, displayName: 'YAML', color: '#b356a3' },
  html: { iconType: 'svg-raw', icon: htmlSvg, displayName: 'HTML', color: '#E34F26' },
  css: { iconType: 'svg-raw', icon: cssSvg, displayName: 'CSS', color: '#1572B6' },
  scss: { iconType: 'svg-raw', icon: sassSvg, displayName: 'SCSS', color: '#CC6699' },
  sass: { iconType: 'svg-raw', icon: sassSvg, displayName: 'Sass', color: '#CC6699' },
  react: { iconType: 'svg-raw', icon: reactSvg, displayName: 'React', color: '#61DAFB' },
  jsx: { iconType: 'svg-raw', icon: reactSvg, displayName: 'React JSX', color: '#61DAFB' },
  tsx: { iconType: 'svg-raw', icon: reactSvg, displayName: 'React TSX', color: '#61DAFB' },
  typescriptreact: { iconType: 'svg-raw', icon: reactSvg, displayName: 'React TSX', color: '#61DAFB' },
  javascriptreact: { iconType: 'svg-raw', icon: reactSvg, displayName: 'React JSX', color: '#61DAFB' },
  node: { iconType: 'svg-raw', icon: nodejsSvg, displayName: 'Node.js', color: '#339933' },
  nodejs: { iconType: 'svg-raw', icon: nodejsSvg, displayName: 'Node.js', color: '#339933' },
  docker: { iconType: 'svg-raw', icon: dockerSvg, displayName: 'Dockerfile', color: '#2496ED' },
  dockerfile: { iconType: 'svg-raw', icon: dockerSvg, displayName: 'Dockerfile', color: '#2496ED' },
  markdown: { iconType: 'svg-raw', icon: markdownSvg, displayName: 'Markdown', color: '#8b9cf7' },
  md: { iconType: 'svg-raw', icon: markdownSvg, displayName: 'Markdown', color: '#8b9cf7' },
  kubernetes: { iconType: 'svg-raw', icon: kubernetesSvg, displayName: 'Kubernetes', color: '#326CE5' },
  k8s: { iconType: 'svg-raw', icon: kubernetesSvg, displayName: 'Kubernetes', color: '#326CE5' },
  mongodb: { iconType: 'svg-raw', icon: mongodbSvg, displayName: 'MongoDB', color: '#47A248' },
  mongo: { iconType: 'svg-raw', icon: mongodbSvg, displayName: 'MongoDB', color: '#47A248' },
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

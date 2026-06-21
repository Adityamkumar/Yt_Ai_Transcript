import { DYNAMIC_GREETINGS } from '@/constants/dynamicGreetings';





export function getRandomGreeting(name?: string): string {
  const finalName = name && name.trim() ? name.trim() : "Learner";
  const randomIndex = Math.floor(Math.random() * DYNAMIC_GREETINGS.length);
  const template = DYNAMIC_GREETINGS[randomIndex];
  
  return template.replace("{name}", finalName);
}

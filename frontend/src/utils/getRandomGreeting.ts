import { DYNAMIC_GREETINGS } from '@/constants/dynamicGreetings';

/**
 * Returns a random greeting from the dynamic greetings pool, substituting the user's name.
 * Falls back to "Learner" if name is undefined or empty.
 */
export function getRandomGreeting(name?: string): string {
  const finalName = name && name.trim() ? name.trim() : "Learner";
  const randomIndex = Math.floor(Math.random() * DYNAMIC_GREETINGS.length);
  const template = DYNAMIC_GREETINGS[randomIndex];
  
  return template.replace("{name}", finalName);
}

export interface WorkspaceAction {
  id: string;
  label: string;
  prompt: string;
  type: 'notes' | 'summary' | 'chat';
  icon: string;
}

export const WORKSPACE_ACTIONS: WorkspaceAction[] = [
  {
    id: 'smart-notes',
    label: 'Generate Smart Notes',
    prompt: 'Generate complete structured educational notes for this video.',
    type: 'notes',
    icon: 'FileText',
  },
  {
    id: 'summarize',
    label: 'Summarize Video',
    prompt: 'Provide a concise summary of this video with key timestamped highlights.',
    type: 'summary',
    icon: 'Sparkles',
  },
  {
    id: 'key-takeaways',
    label: 'Key Takeaways',
    prompt: 'What are the 5 most important takeaways from this video?',
    type: 'chat',
    icon: 'CheckCircle2',
  },
  {
    id: 'quiz',
    label: 'Create a Quiz',
    prompt: 'Generate 5 quiz questions with answers based on the content of this video.',
    type: 'chat',
    icon: 'FileQuestion',
  },
  {
    id: 'key-concepts',
    label: 'Key Concepts',
    prompt: 'What are the core concepts and ideas explained in this video?',
    type: 'chat',
    icon: 'BrainCircuit',
  },
  {
    id: 'action-items',
    label: 'Actionable Takeaways',
    prompt: 'What actionable advice or next steps does this video suggest?',
    type: 'chat',
    icon: 'ListChecks',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    prompt: 'Create 8 flashcard-style question-and-answer pairs from the key concepts in this video.',
    type: 'chat',
    icon: 'Layers',
  },
];

namespace NodeJS {
  interface ProcessEnv {
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRY: string;
    PORT: string;
    MONGODB_URI: string;
    GEMINI_GENERATION_API_KEY: string;
    GEMINI_EMBEDDING_API_KEY: string;
  }
}


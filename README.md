<div align="center">
  <h1>🧠 YouTube & PDF AI Assistant</h1>
  <p><strong>Ask questions, get summaries, and study YouTube transcripts or PDF documents using AI</strong></p>
  
  ![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

<br />

This is a full-stack project designed to help you study and get information from video transcripts and PDF documents. You paste a YouTube link or upload a PDF file, and the app will index the content and let you chat with it, ask questions, or generate structured study notes and summaries.

It has a responsive dark-mode interface, simple login/signup (including Google Login), and uses RAG (Retrieval-Augmented Generation) so the AI responses stay grounded in the video transcript or PDF text.

---

## 📸 Screenshots

| Dashboard | AI Chat Interface |
| :---: | :---: |
| ![Landing Page](./frontend/public/landing.png) | ![Chat Interface](./frontend/public/dashboard.png) |

---

## 📑 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ How the RAG Database works](#️-how-the-rag-database-works)
- [🔄 Retries & Cooldown System](#-retries--cooldown-system)
- [🚀 Getting Started](#-getting-started)
- [🛡️ Security & Account Settings](#️-security--account-settings)
- [📄 License](#-license)

---

## ✨ Features

- **📺 YouTube Transcript Chat:** Paste any YouTube link, download its transcript, and ask questions. The AI replies and links back to the specific timestamp of the video.
- **📄 PDF Chat:** Upload a PDF file, index it, and ask questions about its pages.
- **📝 Study Notes & Summaries:** Automatically turn transcripts or PDFs into bullet points, key takeaways, and neat revision sheets.
- **🔐 Google & Local Login:** Log in using your email/password or use Google Sign-in. The app automatically links them if they share the same email.
- **🔖 Saved Bookmarks:** Bookmark specific AI answers or notes to find them later easily.
- **🔄 Auto-Retries & Cooldown:** If the AI embedding pipeline hits a rate limit, it automatically tries again in the background. If it fails 4 times, it locks for a 10-minute cooldown showing a countdown timer, then automatically unlocks so you can try again.
- **🔒 Deduplication:** If you upload the same PDF twice, the app detects its hash, opens your existing chat, and avoids duplicate storage or processing.
- **💬 Friendly Error Messages:** User messages are simple and friendly (no scary tech jargon or API error codes).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript (built with Vite)
- **Styling:** Tailwind CSS v4 + Framer Motion for simple animations
- **State Management:** Zustand (global states) + React Context (Auth State)
- **Routing & API:** React Router v7 + TanStack React Query (with Axios)

### Backend
- **Server:** Node.js + Express.js (TypeScript)
- **Database:** MongoDB + Mongoose ORM
- **Auth:** Passport.js (Google OAuth 2.0), JWT (JSON Web Tokens) in HttpOnly cookies, and bcrypt for passwords
- **AI Service:** Google GenAI SDK (`@google/genai`) with the Gemini 3.5 Flash / Flash Preview models
- **Parsing Pipelines:** `youtube-transcript` for video captions, `pdf-parse-new` for reading PDFs
- **Cloud Storage:** ImageKit to host uploaded PDFs

---

## 🏗️ How the RAG Database works

To keep database queries fast and avoid storing heavy arrays inside video or document metadata, the database is split into two layers:

1. **Metadata collections (`videos` & `pdfdocuments`):** Only store basic details like title, URL, chunk count, and loading statuses.
2. **Text Chunk collections (`transcriptchunks` & `pdfchunks`):** Store the actual text paragraphs, their order index, timestamps (start/end/duration), and 1536-dimension vectors for AI similarity search.

When you ask a question, the server compares your question against the text chunk collection, extracts the top 8 most similar chunks, and sends only those chunks to the Gemini model to get an accurate answer.

---

## 🔄 Retries & Cooldown System

To handle API failures or rate limits without breaking the app:
- **Attempts:** Up to 2 automatic attempts are run in the background. If those fail, you can click "Try again" manually up to 2 times (total of 4 attempts).
- **10-Minute Cooldown:** If the 4th attempt fails, the retry button gets disabled and shows a live countdown (e.g., `Try again later (9m 45s)`). The status says: `AI is temporarily unavailable. Please try again shortly.`
- **Auto Unlock:** Once the timer hits 0, the retry button automatically enables itself without a page refresh, letting you try again.
- **Idempotence:** Every retry wipes old incomplete chunks before inserting new ones to prevent duplicate database entries.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas)
- Google Cloud Console credentials (for Google Login)
- Gemini API Key (from Google AI Studio)
- ImageKit account (for PDF uploads)

### Setup Instructions

1. **Clone the project**
   ```bash
   git clone https://github.com/Adityamkumar/Yt_Ai_Transcript.git
   cd Yt_Ai_Transcript
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_jwt_access_secret
   REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=7d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   GEMINI_API_KEY=your_gemini_api_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend/` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

4. **MongoDB Vector Indexes Setup**
   If you are hosting on MongoDB Atlas, set up two vector search indexes:
   - Index named `pdfchunks_vector_index` on the `pdfchunks` collection for the `embedding` field (1536 dimensions, cosine similarity).
   - Index named `transcriptchunks_vector_index` on the `transcriptchunks` collection for the `embedding` field (1536 dimensions, cosine similarity).

5. **Open App**
   Open `http://localhost:5173` in your browser to start using the app.

---

## 🛡️ Security & Account Settings

- **Secure Login:** Session tokens are stored in secure HttpOnly cookies.
- **XSS Filter:** HTML tags in AI replies are sanitized using `dompurify` to prevent cross-site scripting.
- **Provider Checks:** Safe password checks are run on account deletion to make sure OAuth users can delete their profiles safely without errors.

---

## 📄 License

Licensed under the ISC License.

---

<div align="center">
  <p>Built with ❤️ by <strong>Aditya</strong></p>
</div>

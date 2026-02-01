# Document Knowledge Base

A modern document Q&A system built with Next.js, Supermemory, Clerk Authentication, shadcn/ui, and Vercel AI SDK. Upload documents into collections and ask questions with AI-powered answers using GPT-4o-mini.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)

## Features

🔐 **Authentication & Security**
- Secure user authentication powered by Clerk
- Protected routes - only authenticated users can access the app
- User management with sign-in/sign-out functionality
- No sign-up option (invite-only or admin-controlled access)

✨ **Collection-Based Organization**
- Create unlimited collections to organize documents
- View collections in a responsive grid layout
- Collection cards show document count and last updated date
- Delete entire collections with all their documents

📂 **Document Management**
- Upload PDFs, DOCX, TXT, and Markdown files
- Add web pages via URL
- View all documents within a collection
- Delete individual documents
- Track document status (ready, processing, failed)

🤖 **AI-Powered Q&A with GPT-4o-mini**
- Ask questions in natural language
- Get accurate answers with source citations
- **Global search across ALL collections** - no need to switch contexts
- Context-aware responses using Vercel AI SDK
- Powered by OpenAI's GPT-4o-mini

📚 **Smart Document Indexing**
- Automatic document processing via Supermemory
- Semantic search across all documents
- Relevance scoring and chunk analysis
- Direct references to source material

🎨 **Modern UI**
- Built with shadcn/ui components
- Tab-based interface: Chat and Collections
- Fully responsive design
- Toast notifications for user feedback
- Loading skeletons and smooth transitions
- Dialog confirmations for destructive actions

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** Clerk
- **AI:** Vercel AI SDK v6
- **Memory/RAG:** Supermemory
- **LLM:** OpenAI GPT-4o-mini

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account and API keys ([Get started here](https://clerk.com))
- Supermemory API key ([Get one here](https://console.supermemory.ai))
- OpenAI API key ([Get one here](https://platform.openai.com))

## Installation

1. **Clone or download the project**

```bash
cd document_kb
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and add your API keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# AI Services
SUPERMEMORY_API_KEY=your_supermemory_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Configure Clerk (Required)**

- Create an account at [Clerk](https://clerk.com)
- Create a new application in the Clerk dashboard
- Copy the Publishable Key and Secret Key to your `.env`
- Configure your sign-in URL to `/sign-in` in the Clerk dashboard

5. Customize your app name

- modify the appName constant in app/lib/constants.ts

6. **Run the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Keeping Your Private Clone Updated

If you've cloned this repository for private use and want to stay up-to-date with public improvements, follow this workflow:

### Initial Setup

1. **Clone the public repository:**
   ```bash
   git clone <public-repo-url>
   cd document_kb
   ```

2. **Create your private repository** on GitHub/GitLab (don't initialize it with any files)

3. **Update the remote to point to your private repo:**
   ```bash
   git remote set-url origin <your-private-repo-url>
   ```

4. **Add the public repository as an upstream remote:**
   ```bash
   git remote add upstream <public-repo-url>
   ```

5. **Push to your private repository:**
   ```bash
   git push origin main
   ```

### Regular Workflow

**For your day-to-day work** (all commits and pushes go to your private repository):
```bash
git add .
git commit -m "your changes"
git push  # automatically pushes to your private repo
```

**To pull updates from the public repository:**
```bash
# Fetch the latest changes from the public repo
git fetch upstream

# Merge the updates into your local branch
git merge upstream/main

# Push the merged updates to your private repo
git push
```

**Verify your remotes** at any time:
```bash
git remote -v
# Should show:
# origin    <your-private-repo-url> (fetch)
# origin    <your-private-repo-url> (push)
# upstream  <public-repo-url> (fetch)
# upstream  <public-repo-url> (push)
```

This setup ensures:
- Your private work stays in your private repository
- You can easily pull improvements from the public repository
- You cannot accidentally push to the public repository (you don't have write access)

## Usage

### Authentication

**First Time Access:**
- Navigate to the application
- You'll be automatically redirected to the sign-in page
- Sign in with your credentials
- Once authenticated, you'll have full access to the application

**Signed-In Experience:**
- The header displays the app title and your user button
- Click the user button to manage your account or sign out
- All routes are protected - unauthenticated users cannot access any content

### Interface Overview

The application has two main tabs:

1. **Chat** - Ask questions and get AI-powered answers
2. **Collections** - Manage your document collections

### 1. Managing Collections

**Create a Collection:**
- Go to the "Collections" tab
- Click "Create New Collection" card
- Enter a unique collection name
- Click Create

**View Collection Details:**
- Click on any collection card to open its detail view
- See all documents in the collection
- Upload new documents directly to the collection

**Delete a Collection:**
- Click the trash icon on a collection card, or
- In the collection detail view, click "Delete Collection"
- Confirm to permanently delete the collection and all its documents

**Best Practices:**
- Use collections to organize documents by topic, project, or department
- Create collections before uploading documents
- Collections can contain hundreds of documents

### 2. Uploading Documents

**Upload Files:**
- Navigate to a collection (click on it)
- Click "Upload Files" button
- Select one or more files (PDF, DOCX, TXT, MD)
- Wait for the upload to complete

**Add URLs:**
- In the collection detail view, paste a URL in the input field
- Click the link icon or press Enter
- The web page content will be added to the collection

### 3. Managing Documents

**View Documents:**
- Open a collection to see all documents
- Documents show file type, status, and upload date

**Delete Documents:**
- Hover over any document and click the trash icon
- Confirm deletion to remove from Supermemory
- Documents are permanently deleted

### 4. Asking Questions (Global Search)

- Go to the "Chat" tab
- Type your question in the input field
- Press Enter or click Send
- The AI searches across **ALL collections** for relevant information
- Receive AI-powered answers with source citations

### Example Questions

- "What are the main findings in these documents?"
- "Summarize the key points from document 2"
- "What does the research say about [topic]?"
- "Compare the approaches mentioned in different documents"

## Project Structure

```
app/
├── api/
│   ├── collections/
│   │   ├── route.ts              # List/create collections
│   │   └── [name]/
│   │       └── route.ts          # Delete collection and all docs
│   ├── memories/
│   │   ├── route.ts              # List/add/delete memories
│   │   └── [id]/
│   │       └── route.ts          # Get memory details
│   ├── qa/
│   │   └── route.ts              # Q&A endpoint (global search)
│   └── upload-document/
│       └── route.ts              # File upload endpoint
├── sign-in/
│   └── [[...sign-in]]/
│       └── page.tsx              # Clerk sign-in page
├── layout.tsx                    # Root layout with ClerkProvider
├── page.tsx                      # Main interface with tabs
└── globals.css                   # Global styles

components/
├── collection-card.tsx           # Collection display card
├── collection-detail.tsx         # Collection detail view
├── collection-grid.tsx           # Grid layout for collections
├── create-collection-dialog.tsx  # Create collection dialog
└── ui/                           # shadcn/ui components
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── scroll-area.tsx
    ├── skeleton.tsx
    ├── tabs.tsx
    ├── toast.tsx
    ├── toaster.tsx
    └── use-toast.ts

lib/
├── document-processor.ts        # Document handling logic
└── utils.ts                     # Utility functions

proxy.ts                         # Clerk middleware for route protection
```

## Key Components

### Authentication Middleware (`proxy.ts`)

Protects all routes using Clerk's middleware:
- Public routes: `/sign-in` only
- All other routes require authentication
- Unauthenticated users are automatically redirected to sign-in

### Document Processor (`lib/document-processor.ts`)

Handles all document operations:
- File uploads to Supermemory
- URL processing
- Document listing and status tracking
- Collection management (create, list, delete)
- Metadata management

### Q&A API (`app/api/qa/route.ts`)

Processes questions using:
1. **Global search** across all collections (no collection filter)
2. Context preparation from search results
3. Vercel AI SDK v6 streaming responses
4. Source citation generation with [Document X] format

### Collections API (`app/api/collections/`)

- `GET /api/collections` - List all collections
- `POST /api/collections` - Validate/create a new collection
- `DELETE /api/collections/[name]` - Delete collection and all documents

### Main Interface (`app/page.tsx`)

React component featuring:
- Tab navigation between Chat and Collections
- Chat interface with message history
- Collections grid with detail view
- Toast notifications

## Configuration

### Authentication Settings

Clerk middleware configuration in [`proxy.ts`](proxy.ts:1):

```typescript
const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-in/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})
```

### Q&A Search Parameters

Adjust in `app/api/qa/route.ts`:

```typescript
const searchResults = await client.search.documents({
  q: question,
  limit: 8,                    // Number of documents to retrieve
  rerank: true,                // Enable reranking for better results
  documentThreshold: 0.3,      // Minimum document relevance score
  chunkThreshold: 0.4,         // Minimum chunk relevance score
});
```

Note: There is no `containerTags` filter - search is global across all collections.

### AI Model Settings

Adjust in `app/api/qa/route.ts`:

```typescript
const result = streamText({
  model: openai('gpt-4o-mini'),  // Change model here
  temperature: 0.1,               // Lower = more focused
  maxOutputTokens: 2000,          // Maximum response length
});
```

## Performance Tips

1. **Optimize Document Size:** Split large documents into smaller chunks
2. **Organize with Collections:** Keep related documents together
3. **Global Search:** Q&A automatically searches all collections - no need to switch contexts
4. **Adjust Thresholds:** Fine-tune relevance thresholds for your use case

## Recent Changes

### Latest Updates
- **Clerk Authentication:** Full authentication system with protected routes and user management
- **Global Q&A Search:** Questions now search across all collections automatically
- **Redesigned Collections UI:** New grid layout with cards and detail views
- **Collection Management:** Create empty collections, delete collections with all documents
- **Tab Interface:** Clean separation between Chat and Collections
- **Toast Notifications:** Better user feedback for actions

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supermemory Documentation](https://supermemory.ai/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Documentation](https://platform.openai.com/docs)

## Support

For issues and questions:
- Check the [Clerk Docs](https://clerk.com/docs)
- Check the [Supermemory Docs](https://supermemory.ai/docs)
- Review the [AI SDK Documentation](https://sdk.vercel.ai/docs)
- Open an issue on GitHub

---

Built with ❤️ using Clerk, Supermemory, Next.js, Vercel AI SDK, and OpenAI
# Digital Twin MCP Server Project Instructions

## Project Overview
Build an MCP server using the roll dice pattern to create a digital twin assistant that can answer questions about a person's professional profile using RAG (Retrieval-Augmented Generation).

## Reference Repositories
- **Pattern Reference**: https://github.com/gocallum/rolldice-mcpserver.git
  - Roll dice MCP server - use same technology and pattern for our MCP server
- **Logic Reference**: https://github.com/gocallum/binal_digital-twin_py.git
  - Python code using Upstash Vector for RAG search with Groq and LLaMA for generations

## Core Functionality
- MCP server accepts user questions about the person's professional background
- Create server actions that search Upstash Vector database and return RAG results
- Search logic must match the Python version exactly

## Environment Variables (.env.local)
```
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
GROQ_API_KEY=
```

## Technical Requirements
- **Framework**: Next.js 15.5.3+ (use latest available)
- **Package Manager**: Always use pnpm (never npm or yarn)
- **Commands**: Always use Windows PowerShell commands
- **Type Safety**: Enforce strong TypeScript type safety throughout
- **Architecture**: Always use server actions where possible
- **Styling**: Use globals.css instead of inline styling
- **UI Framework**: ShadCN with dark mode theme
- **Focus**: Prioritize MCP functionality over UI - UI is primarily for MCP server configuration

## Setup Commands
```bash
pnpm dlx shadcn@latest init
```
Reference: https://ui.shadcn.com/docs/installation/next

## Upstash Vector Integration

### Key Documentation
- Getting Started: https://upstash.com/docs/vector/overall/getstarted
- Embedding Models: https://upstash.com/docs/vector/features/embeddingmodels
- TypeScript SDK: https://upstash.com/docs/vector/sdks/ts/getting-started

### Example Implementation
```typescript
import { Index } from "@upstash/vector"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

// RAG search example
await index.query({
  data: "What is Upstash?",
  topK: 3,
  includeMetadata: true,
})
```

## Groq Integration

### Key Documentation
- Groq API: https://console.groq.com/docs/quickstart
- TypeScript SDK: https://github.com/groq/groq-typescript

### Example Implementation
```typescript
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

const completion = await groq.chat.completions.create({
  messages: [
    {
      role: "system",
      content: "You are an AI digital twin...",
    },
    {
      role: "user",
      content: prompt,
    },
  ],
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
  max_tokens: 500,
})
```

## MCP Server Implementation

### Server Actions Pattern
```typescript
'use server'

export async function digitalTwinQuery(question: string) {
  // 1. Query Upstash Vector
  const vectorResults = await index.query({
    data: question,
    topK: 3,
    includeMetadata: true,
  })
  
  // 2. Extract context from results
  const context = vectorResults
    .map(result => result.metadata?.content)
    .join('\n\n')
  
  // 3. Generate response with Groq
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an AI digital twin..." },
      { role: "user", content: `Context: ${context}\n\nQuestion: ${question}` }
    ],
    model: "llama-3.1-8b-instant",
  })
  
  return response.choices[0]?.message?.content
}
```

### MCP Endpoint Structure
Create `/app/api/mcp/route.ts` for MCP protocol handling

## Data Structure
The digital twin data comes from `digitaltwin.json` with the following structure:
- personal: Basic profile information
- salary_location: Compensation and location preferences
- experience: Work history with STAR format achievements
- skills: Technical and soft skills
- education: Academic background
- projects_portfolio: Key projects
- career_goals: Career aspirations
- interview_prep: Common questions and responses
- content_chunks: Pre-chunked content for vector storage (THIS IS THE MOST IMPORTANT)

## Development Workflow
1. Install dependencies with pnpm
2. Set up environment variables in .env.local
3. Initialize ShadCN UI components as needed
4. Create server actions for RAG functionality
5. Implement MCP endpoint
6. Test locally before deployment
7. Deploy to Vercel

## Testing
- Test MCP server with VS Code Insiders + GitHub Copilot
- Verify vector search returns relevant results
- Ensure Groq responses are accurate and contextual
- Test with various interview preparation questions

## Additional Useful Resources
- MCP Protocol Documentation: https://modelcontextprotocol.io/
- Next.js Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Vercel Deployment: https://vercel.com/docs

---

**Note**: This file provides context for GitHub Copilot to generate accurate, project-specific code suggestions. Keep it updated as requirements evolve.

import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Supermemory } from 'supermemory';

// Validate environment variables
const supermemoryApiKey = process.env.SUPERMEMORY_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supermemoryApiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

if (!openaiApiKey) {
  throw new Error(
    'The OPENAI_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

// Configure OpenAI
const openai = createOpenAI({
  apiKey: openaiApiKey,
});

const client = new Supermemory({ apiKey: supermemoryApiKey });

export async function POST(request: Request) {
  const { messages } = await request.json();

  // Extract the latest user message (ai-sdk v6 uses parts array with text)
  const lastMessage = messages[messages.length - 1];
  const question = lastMessage.parts
    ?.filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('') || lastMessage.content;

    // Convert messages to the format expected by streamText (content string, not parts)
    const formattedMessages = messages
      .map((msg: any) => {
        // Extract content from parts array (ai-sdk v6 format) or fall back to content field
        let content = '';
        if (msg.parts && Array.isArray(msg.parts)) {
          content = msg.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
        }
        if (!content && msg.content) {
          content = msg.content;
        }
        return {
          role: msg.role,
          content: content,
        };
      })
      // Only allow valid roles: system, user, assistant, tool
      .filter((msg: any) => 
        msg.content && 
        msg.content.trim().length > 0 && 
        ['system', 'user', 'assistant', 'tool'].includes(msg.role)
      ); // Remove empty messages and unsupported roles

    // Ensure we have at least one message (the current question)
    if (formattedMessages.length === 0) {
      return Response.json(
        { error: 'No valid messages provided' },
        { status: 400 }
      );
    }

  try {
    // Search for relevant documents across all collections
    const searchResults = await client.search.documents({
      q: question,
      limit: 8,
      rerank: true,
      includeFullDocs: true,
      includeSummary: true,
      onlyMatchingChunks: false,
      documentThreshold: 0.3,
      chunkThreshold: 0.4,
    });

    if (searchResults.results.length === 0) {
      return Response.json({
        answer:
          "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: [],
        confidence: 0,
      });
    }

    // Fetch full document details to get containerTags (collections)
    const documentDetails = await Promise.all(
      searchResults.results.map(async (result) => {
        try {
          const doc = await client.documents.get(result.documentId);
          return doc;
        } catch (e) {
          return null;
        }
      })
    );

    // Prepare context from search results
    const context = searchResults.results
      .map((result, index) => {
        // Use relevant chunks if available, otherwise use top chunks by score
        let relevantChunks = result.chunks.filter((chunk) => chunk.isRelevant);
        
        // If no chunks are marked as relevant, use all chunks sorted by score
        if (relevantChunks.length === 0) {
          relevantChunks = result.chunks
            .sort((a, b) => (b.score || 0) - (a.score || 0));
        }
        
        const chunks = relevantChunks
          .slice(0, 3)
          .map((chunk) => chunk.content)
          .join('\n\n');

        return `[Document ${index + 1}: "${result.title}" (ID: ${result.documentId})]\n${chunks}`;
      })
      .join('\n\n---\n\n');

    // Prepare sources with document URLs and collections for citation
    const sources = searchResults.results.map((result, index) => {
      // Extract URL from metadata - check both content (for full docs) and metadata
      const content = (result as any).content || '';
      const metadata = (result as any).metadata || {};
      const originalUrl = metadata.originalUrl || metadata.url || null;
      
      // Get collections from the full document details
      const fullDoc = documentDetails[index];
      const containerTags = (fullDoc as any)?.containerTags || [];
      const collections = containerTags.filter((tag: string) => tag !== 'all');
      
      return {
        id: result.documentId,
        title: result.title,
        type: result.type,
        url: originalUrl,
        collections: collections,
        relevantChunks: result.chunks.filter((chunk) => chunk.isRelevant).length || result.chunks.length,
        score: result.score,
        citationNumber: index + 1,
      };
    });

    const sourcesList = sources
      .map((source) => {
        const collectionsInfo = source.collections.length > 0 
          ? ` (Collections: ${source.collections.join(', ')})` 
          : '';
        if (source.url) {
          return `${source.citationNumber}. [${source.title}](${source.url})${collectionsInfo}`;
        } else {
          return `${source.citationNumber}. [${source.title}](doc://${source.id})${collectionsInfo}`;
        }
      })
      .join('\n');

    const systemPrompt = `You are a helpful document Q&A assistant. Answer questions based ONLY on the provided document context.

CONTEXT FROM DOCUMENTS:
${context}

INSTRUCTIONS:
1. Answer the question using ONLY the information from the provided documents
2. If the documents don't contain enough information, say so clearly
3. Be accurate and quote directly when possible
4. Maintain a helpful, professional tone
5. ALWAYS include a "## Sources" section at the end listing all documents you referenced

SOURCES SECTION FORMAT:
At the end of your response, add:
## Sources

${sourcesList}

If the question cannot be answered from the provided documents, respond with: "I don't have enough information in the provided documents to answer this question accurately."`;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: formattedMessages,
      system: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 2000,
    });

    // Stream the response using text stream format for TextStreamChatTransport
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Q&A error:', error);
    return Response.json(
      { error: 'Failed to process question', details: error.message },
      { status: 500 }
    );
  }
}

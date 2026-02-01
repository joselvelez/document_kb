export interface ParsedCitation {
  fullMatch: string;
  citationNumber: number;
}

export interface SourceItem {
  number: number;
  title: string;
  url: string;
  isDocumentLink: boolean;
  documentId?: string;
  collections: string[];
}

/**
 * Parses footnote-style citations [1], [2], etc. from text
 */
export function parseFootnoteCitations(text: string): ParsedCitation[] {
  const citations: ParsedCitation[] = [];
  const regex = /\[(\d+)\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const citationNumber = parseInt(match[1], 10);

    citations.push({
      fullMatch,
      citationNumber,
    });
  }

  return citations;
}

/**
 * Extracts the Sources section from a message and parses the sources
 * Expected format:
 * ## Sources
 * 1. [Document Title](doc://documentId) (Collections: collection1, collection2)
 * 2. [Document Title](https://url) (Collections: collection1)
 */
export function extractSourcesSection(text: string): { mainText: string; sources: SourceItem[] } {
  // Find the Sources section
  const sourcesRegex = /##\s*Sources\s*\n\n?([\s\S]*)$/i;
  const match = text.match(sourcesRegex);

  if (match) {
    const mainText = text.substring(0, match.index).trim();
    const sourcesText = match[1].trim();
    
    // Parse each source line
    const sources: SourceItem[] = [];
    const lines = sourcesText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Match format: "1. [Title](url) (Collections: collection1, collection2)"
      const numberedMatch = line.match(/^\s*(\d+)\.\s*\[([^\]]+)\]\(([^)]+)\)(?:\s*\(Collections:\s*([^)]+)\))?/);
      
      if (numberedMatch) {
        const number = parseInt(numberedMatch[1], 10);
        const title = numberedMatch[2];
        const url = numberedMatch[3];
        const isDocumentLink = url.startsWith('doc://');
        const documentId = isDocumentLink ? url.replace('doc://', '') : undefined;
        
        // Parse collections if present
        const collectionsText = numberedMatch[4];
        const collections = collectionsText 
          ? collectionsText.split(',').map(c => c.trim()).filter(c => c.length > 0)
          : [];
        
        sources.push({
          number,
          title,
          url,
          isDocumentLink,
          documentId,
          collections,
        });
      }
    }
    
    return { mainText, sources };
  }

  return { mainText: text, sources: [] };
}

/**
 * Splits text into segments (text and footnote citations)
 */
export interface TextSegment {
  type: 'text' | 'citation';
  content: string;
  citation?: ParsedCitation;
}

export function parseTextWithFootnotes(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const footnoteRegex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = footnoteRegex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add the citation
    const fullMatch = match[0];
    const citationNumber = parseInt(match[1], 10);

    segments.push({
      type: 'citation',
      content: fullMatch,
      citation: {
        fullMatch,
        citationNumber,
      },
    });

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return segments;
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport, isTextUIPart } from 'ai';
import { DocumentProcessor, type Document, type DocumentContent } from '@/lib/document-processor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { CollectionGrid } from '@/components/collection-grid';
import { CollectionDetail } from '@/components/collection-detail';
import { CreateCollectionDialog } from '@/components/create-collection-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  extractSourcesSection,
  type SourceItem,
} from '@/lib/citation-parser';
import {
  Send,
  FileText,
  Loader2,
  RefreshCw,
  Database,
  MessageSquare,
  ExternalLink,
  FileIcon,
} from 'lucide-react';

interface Collection {
  name: string;
  documentCount: number;
  lastUpdated?: string | null;
}

// Component to render plain message text (stops at Sources section)
function MessageContent({
  text,
}: {
  text: string;
}) {
  // Extract only the main text (before Sources section)
  const { mainText } = extractSourcesSection(text);
  return <div className="whitespace-pre-wrap">{mainText}</div>;
}

// Component to render sources section
function SourcesSection({ 
  text, 
  onDocumentClick 
}: { 
  text: string;
  onDocumentClick: (docId: string) => void;
}) {
  const { sources } = extractSourcesSection(text);
  
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Sources</h4>
      <ul className="space-y-1">
          {sources.map((source: SourceItem) => {
          return (
            <li key={source.number} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[1.5rem]">{source.number}.</span>
                {source.isDocumentLink ? (
                  <button
                    onClick={() => onDocumentClick(source.documentId!)}
                    className="text-primary hover:underline text-left inline-flex items-center gap-1"
                  >
                    {source.title}
                    <FileIcon className="h-3 w-3" />
                  </button>
                ) : (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {source.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {source.collections.length > 0 && (
                <div className="ml-6 mt-0.5 text-xs text-muted-foreground">
                  Collections: {source.collections.join(', ')}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Document Viewer Dialog Component
function DocumentViewerDialog({
  isOpen,
  onClose,
  documentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
}) {
  const [doc, setDoc] = useState<DocumentContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const processor = useRef(new DocumentProcessor());

  useEffect(() => {
    if (isOpen && documentId) {
      setIsLoading(true);
      processor.current
        .getDocument(documentId)
        .then((document) => {
          setDoc(document);
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: 'Failed to load document: ' + error.message,
            variant: 'destructive',
          });
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDoc(null);
    }
  }, [isOpen, documentId, toast, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{doc?.title || 'Document'}</span>
            {doc?.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open original
              </a>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading document...</span>
            </div>
          ) : doc ? (
            <ScrollArea className="h-[55vh] pr-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {doc.content ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {doc.content}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No content available</p>
                )}
              </div>
            </ScrollArea>
          ) : null}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Separate Chat component
function ChatInterface({ documents }: { documents: Document[] }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/qa',
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');
    await sendMessage({ text: currentInput });
  };

  const handleDocumentClick = (docId: string) => {
    setSelectedDocId(docId);
    setViewerOpen(true);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle>Ask Questions</CardTitle>
          <CardDescription>
            Get AI-powered answers from all your documents
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)] flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-muted-foreground text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">
                    Upload documents and ask questions!
                  </p>
                  <div className="text-sm mt-4 space-y-1">
                    <p className="font-medium">Try asking:</p>
                    <ul className="space-y-1">
                      <li>• "What are the main findings?"</li>
                      <li>• "Summarize the key points"</li>
                      <li>• "Compare the approaches in different documents"</li>
                    </ul>
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const text = message.parts
                  .filter(isTextUIPart)
                  .map((part) => part.text)
                  .join('');
                
                return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted mr-12'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <>
                        <MessageContent text={text} />
                        <SourcesSection text={text} onDocumentClick={handleDocumentClick} />
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap">{text}</div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="bg-muted p-4 rounded-lg mr-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching documents and generating answer...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question about your documents..."
              disabled={isLoading || documents.length === 0}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || documents.length === 0}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Upload documents to enable questions
            </p>
          )}
        </CardContent>
      </Card>

      <DocumentViewerDialog
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedDocId(null);
        }}
        documentId={selectedDocId}
      />
    </>
  );
}

// Collections Management Component
function CollectionsManager({
  onRefreshDocuments,
}: {
  onRefreshDocuments: () => void;
}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const processor = new DocumentProcessor();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const collectionNames = await processor.listCollections();

      // Get stats for each collection
      const collectionsWithStats: Collection[] = await Promise.all(
        collectionNames.map(async (name) => {
          const stats = await processor.getCollectionStats(name);
          return {
            name,
            documentCount: stats.totalDocs,
            lastUpdated: stats.lastUpdated,
          };
        })
      );

      setCollections(collectionsWithStats.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load collections: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async (name: string) => {
    try {
      await processor.createCollection(name);
      toast({
        title: 'Success',
        description: `Collection "${name}" created`,
      });
      setIsCreateDialogOpen(false);
      await loadCollections();
      // Automatically select the new collection
      setSelectedCollection(name);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCollection = async (name: string) => {
    try {
      await processor.deleteCollection(name);
      toast({
        title: 'Deleted',
        description: `Collection "${name}" and all its documents have been deleted`,
      });
      await loadCollections();
      onRefreshDocuments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBackToGrid = () => {
    setSelectedCollection(null);
    loadCollections(); // Refresh stats
    onRefreshDocuments();
  };

  if (selectedCollection) {
    return (
      <CollectionDetail
        collectionName={selectedCollection}
        onBack={handleBackToGrid}
        onDeleteCollection={() => {
          handleDeleteCollection(selectedCollection);
          setSelectedCollection(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Collections</h2>
            <p className="text-muted-foreground">
              Manage your document collections
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadCollections}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <CollectionGrid
          collections={collections}
          isLoading={isLoading}
          onSelectCollection={setSelectedCollection}
          onDeleteCollection={handleDeleteCollection}
          onCreateCollection={() => setIsCreateDialogOpen(true)}
        />
      </div>

      <CreateCollectionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateCollection}
        existingCollections={collections.map((c) => c.name)}
      />
    </>
  );
}

export default function DocumentQA() {
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  const processor = new DocumentProcessor();

  useEffect(() => {
    loadAllDocuments();
  }, []);

  const loadAllDocuments = async () => {
    try {
      const allDocs: Document[] = [];
      const cols = await processor.listCollections();
      for (const col of cols) {
        const docs = await processor.listDocuments(col);
        allDocs.push(...docs);
      }
      setAllDocuments(allDocs);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load documents: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="collections">
              <Database className="mr-2 h-4 w-4" />
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <ChatInterface documents={allDocuments} />
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <CollectionsManager onRefreshDocuments={loadAllDocuments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

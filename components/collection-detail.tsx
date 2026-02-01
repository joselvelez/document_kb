'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Trash2,
  FileText,
  Loader2,
  Eye,
  ExternalLink,
  Info,
} from 'lucide-react';
import { DocumentProcessor, type Document, type DocumentContent } from '@/lib/document-processor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface CollectionDetailProps {
  collectionName: string;
  onBack: () => void;
  onDeleteCollection: () => void;
}

export function CollectionDetail({
  collectionName,
  onBack,
  onDeleteCollection,
}: CollectionDetailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [urlInput, setUrlInput] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentContent | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processor = new DocumentProcessor();

  useEffect(() => {
    loadDocuments();
  }, [collectionName]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await processor.listDocuments(collectionName);
      setDocuments(docs);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load documents: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newProgress: Record<string, number> = {};

    try {
      for (const file of Array.from(files)) {
        newProgress[file.name] = 0;
        setUploadProgress({ ...newProgress });

        await processor.uploadDocument({
          file,
          collection: collectionName,
          metadata: {
            uploadedBy: 'user',
            category: 'qa-document',
          },
        });

        newProgress[file.name] = 100;
        setUploadProgress({ ...newProgress });
      }

      toast({
        title: 'Success',
        description: `${files.length} file(s) uploaded successfully`,
      });

      await loadDocuments();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      await processor.uploadURL({
        url: urlInput,
        collection: collectionName,
        metadata: {
          uploadedBy: 'user',
          category: 'qa-document',
        },
      });

      toast({
        title: 'Success',
        description: 'URL added successfully',
      });

      setUrlInput('');
      await loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    try {
      await processor.deleteDocument(docId);
      toast({
        title: 'Deleted',
        description: `"${docTitle}" has been deleted`,
      });
      await loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = async (docId: string) => {
    setIsLoadingDoc(true);
    setViewerOpen(true);
    try {
      const doc = await processor.getDocument(docId);
      setSelectedDoc(doc);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load document: ' + error.message,
        variant: 'destructive',
      });
      setViewerOpen(false);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
      case 'md':
        return '📃';
      case 'url':
        return '🔗';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">{collectionName}</h2>
          <Badge variant="secondary">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Collection</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{collectionName}"? This will
                permanently delete all {documents.length} document
                {documents.length !== 1 ? 's' : ''} in this collection. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive" onClick={onDeleteCollection}>
                Delete Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>

          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com"
              disabled={isUploading}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
            />
            <Button
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
              variant="outline"
              size="icon"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>

          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="truncate flex-1">{filename}</span>
                    <span className="ml-2">{progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents in this collection yet</p>
                    <p className="text-sm mt-1">Upload files or add URLs above</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewDocument(doc.id)}>
                        <div className="font-medium truncate">{doc.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.type} • {doc.status}
                          {doc.uploadedAt && (
                            <> • {new Date(doc.uploadedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleViewDocument(doc.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Document</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{doc.title}"? This
                                action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteDocument(doc.id, doc.title)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedDoc?.title || 'Document'}</span>
              {selectedDoc?.url && (
                <a
                  href={selectedDoc.url}
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
            {isLoadingDoc ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading document...</span>
              </div>
            ) : selectedDoc ? (
              <>
                <div className="flex items-start gap-2 mb-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    This is extracted text content from the document. Supermemory processes 
                    uploaded files to extract searchable text - the original file is not stored. 
                    {selectedDoc?.url && ' The original URL link is available above.'}
                  </p>
                </div>
                <ScrollArea className="h-[55vh] pr-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {selectedDoc.content ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedDoc.content}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No content available</p>
                    )}
                  </div>
                </ScrollArea>
              </>
            ) : null}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setViewerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

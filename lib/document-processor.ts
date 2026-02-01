export interface DocumentUpload {
  file: File;
  collection: string;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  uploadedAt: string;
  url?: string;
  containerTags?: string[];
}

export interface DocumentContent {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  url?: string;
  metadata?: Record<string, any>;
}

export class DocumentProcessor {
  async uploadDocument({ file, collection, metadata = {} }: DocumentUpload) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('containerTags', JSON.stringify([collection]));
      formData.append(
        'metadata',
        JSON.stringify({
          originalName: file.name,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        })
      );

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  async uploadURL({
    url,
    collection,
    metadata = {},
  }: {
    url: string;
    collection: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          collection,
          metadata: {
            uploadedBy: 'user',
            category: 'qa-document',
            ...metadata,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `URL upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('URL upload error:', error);
      throw error;
    }
  }

  private getMetadataValue(
    metadata: unknown,
    key: string
  ): unknown | undefined {
    if (
      typeof metadata === 'object' &&
      metadata !== null &&
      !Array.isArray(metadata) &&
      key in metadata
    ) {
      return (metadata as Record<string, unknown>)[key];
    }
    return undefined;
  }

  async getDocumentStatus(documentId: string) {
    try {
      const response = await fetch(`/api/memories/${documentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to get document status: ${response.statusText}`);
      }

      const memory = await response.json();
      return {
        id: memory.id,
        status: memory.status,
        title: memory.title,
        progress: (this.getMetadataValue(memory.metadata, 'progress') as
          | number
          | undefined) || 0,
      };
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  async getDocument(documentId: string): Promise<DocumentContent> {
    try {
      const response = await fetch(`/api/memories/${documentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to get document: ${response.statusText}`);
      }

      const memory = await response.json();
      return {
        id: memory.id,
        title: memory.title || 'Untitled',
        content: memory.content || '',
        type:
          (this.getMetadataValue(memory.metadata, 'fileType') as
            | string
            | undefined) ||
          (this.getMetadataValue(memory.metadata, 'type') as
            | string
            | undefined) ||
          'unknown',
        status: memory.status,
        createdAt: memory.createdAt,
        url: this.getMetadataValue(memory.metadata, 'originalUrl') as
          | string
          | undefined,
        metadata: memory.metadata,
      };
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  }

  async listDocuments(collection: string): Promise<Document[]> {
    try {
      const response = await fetch(
        `/api/memories?containerTags=${encodeURIComponent(collection)}&limit=50&sort=updatedAt&order=desc`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to list documents: ${response.statusText}`);
      }

      const memories = await response.json();

      return memories.memories.map((memory: any) => ({
        id: memory.id,
        title:
          memory.title ||
          (this.getMetadataValue(memory.metadata, 'originalName') as
            | string
            | undefined) ||
          'Untitled',
        type:
          (this.getMetadataValue(memory.metadata, 'fileType') as
            | string
            | undefined) ||
          (this.getMetadataValue(memory.metadata, 'type') as
            | string
            | undefined) ||
          'unknown',
        uploadedAt:
          (this.getMetadataValue(memory.metadata, 'uploadedAt') as
            | string
            | undefined) || '',
        status: memory.status,
        url: this.getMetadataValue(memory.metadata, 'originalUrl') as
          | string
          | undefined,
        containerTags: memory.containerTags || [],
      }));
    } catch (error) {
      console.error('List documents error:', error);
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    try {
      const response = await fetch('/api/collections');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to list collections: ${response.statusText}`);
      }

      const data = await response.json();
      return data.collections || [];
    } catch (error) {
      console.error('List collections error:', error);
      throw error;
    }
  }

  async getCollectionStats(collection: string) {
    try {
      const docs = await this.listDocuments(collection);
      const types = docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalDocs: docs.length,
        types,
        lastUpdated: docs[0]?.uploadedAt || null,
      };
    } catch (error) {
      console.error('Get collection stats error:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      const response = await fetch(`/api/memories?id=${encodeURIComponent(documentId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to delete document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  async deleteCollection(collectionName: string): Promise<{ deletedCount: number }> {
    try {
      const response = await fetch(`/api/collections/${encodeURIComponent(collectionName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to delete collection: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete collection error:', error);
      throw error;
    }
  }

  async createCollection(collectionName: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: collectionName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to create collection: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create collection error:', error);
      throw error;
    }
  }
}

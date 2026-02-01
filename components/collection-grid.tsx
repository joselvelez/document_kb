'use client';

import { Plus } from 'lucide-react';
import { CollectionCard } from './collection-card';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Collection {
  name: string;
  documentCount: number;
  lastUpdated?: string | null;
}

interface CollectionGridProps {
  collections: Collection[];
  isLoading: boolean;
  onSelectCollection: (name: string) => void;
  onDeleteCollection: (name: string) => void;
  onCreateCollection: () => void;
}

export function CollectionGrid({
  collections,
  isLoading,
  onSelectCollection,
  onDeleteCollection,
  onCreateCollection,
}: CollectionGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Create New Collection Card */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 hover:border-primary/50"
        onClick={onCreateCollection}
      >
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[120px] gap-2">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Create New Collection</span>
        </CardContent>
      </Card>

      {/* Collection Cards */}
      {collections.map((collection) => (
        <CollectionCard
          key={collection.name}
          name={collection.name}
          documentCount={collection.documentCount}
          lastUpdated={collection.lastUpdated}
          onClick={() => onSelectCollection(collection.name)}
          onDelete={() => onDeleteCollection(collection.name)}
        />
      ))}

      {/* Empty State */}
      {collections.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No collections yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Create New Collection" to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
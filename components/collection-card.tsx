'use client';

import { Folder, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CollectionCardProps {
  name: string;
  documentCount: number;
  lastUpdated?: string | null;
  onClick: () => void;
  onDelete: () => void;
}

export function CollectionCard({
  name,
  documentCount,
  lastUpdated,
  onClick,
  onDelete,
}: CollectionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={onClick}>
            <Folder className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg truncate">{name}</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Collection</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{name}"? This will permanently
                  delete all {documentCount} document{documentCount !== 1 ? 's' : ''} in
                  this collection. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  Delete Collection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent onClick={onClick}>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>
              {documentCount} document{documentCount !== 1 ? 's' : ''}
            </span>
          </div>
          {lastUpdated && (
            <span>Updated {new Date(lastUpdated).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
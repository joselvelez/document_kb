import { NextRequest, NextResponse } from 'next/server';
import { Supermemory } from 'supermemory';

const apiKey = process.env.SUPERMEMORY_API_KEY;

if (!apiKey) {
  throw new Error(
    'The SUPERMEMORY_API_KEY environment variable is missing or empty. ' +
    'Please set it in your .env or .env.local file.'
  );
}

const client = new Supermemory({ apiKey });

// DELETE: Delete a collection and all its documents
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const collectionName = decodeURIComponent(name);

    if (!collectionName) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Get all memories in this collection
    const memories = await client.memories.list({
      containerTags: [collectionName],
      limit: 1000,
    });

    // Delete all memories in the collection
    let deletedCount = 0;
    for (const memory of memories.memories) {
      try {
        await client.memories.delete(memory.id);
        deletedCount++;
      } catch (deleteError) {
        console.error(`Failed to delete memory ${memory.id}:`, deleteError);
        // Continue deleting other memories even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Collection "${collectionName}" deleted with ${deletedCount} documents`,
    });
  } catch (error: any) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection', details: error.message },
      { status: 500 }
    );
  }
}
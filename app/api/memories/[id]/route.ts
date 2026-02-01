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

// GET: Get a specific memory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const memory = await client.memories.get(id);
    return NextResponse.json(memory);
  } catch (error: any) {
    console.error('Get memory error:', error);
    return NextResponse.json(
      { error: 'Failed to get memory', details: error.message },
      { status: 500 }
    );
  }
}

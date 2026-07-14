import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newPosition = await prisma.position.create({
      data: {
        name: data.name,
        order: data.order || 0,
      }
    });
    
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
  }
}

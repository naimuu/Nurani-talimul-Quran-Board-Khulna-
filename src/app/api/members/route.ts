import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const members = await prisma.boardMember.findMany({
      include: {
        position: true,
      },
      orderBy: [
        { type: 'asc' }, // usually we group by type
        { position: { order: 'asc' } }
      ]
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.positionId) {
      return NextResponse.json({ error: 'Name and Position are required' }, { status: 400 });
    }

    const newMember = await prisma.boardMember.create({
      data: {
        name: data.name,
        positionId: data.positionId,
        photoUrl: data.photoUrl,
        phone: data.phone,
        type: data.type || "COMMITTEE",
      },
      include: {
        position: true,
      }
    });
    
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

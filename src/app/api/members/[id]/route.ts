import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await prisma.boardMember.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const updatedMember = await prisma.boardMember.update({
      where: { id },
      data: {
        name: data.name,
        positionId: data.positionId,
        photoUrl: data.photoUrl,
        phone: data.phone,
        type: data.type,
      },
      include: {
        position: true,
      }
    });
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

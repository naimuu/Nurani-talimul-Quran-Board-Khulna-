import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if position has members assigned
    const memberCount = await prisma.boardMember.count({
      where: { positionId: id }
    });
    
    if (memberCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete position because it has members assigned to it.' },
        { status: 400 }
      );
    }

    await prisma.position.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: {
        name: data.name,
        order: data.order,
      }
    });
    
    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}

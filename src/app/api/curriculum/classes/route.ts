import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.curriculumClass.findMany({
      orderBy: { order: 'asc' },
      include: {
        books: true,
        examYears: {
          include: {
            exams: true,
          },
        },
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Fetch curriculum classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newClass = await prisma.curriculumClass.create({
      data: {
        name: data.name,
        order: data.order || 0
      }
    });

    if (data.year) {
      await prisma.curriculumExamYear.create({
        data: {
          year: data.year,
          classId: newClass.id
        }
      });
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Create curriculum class error:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}

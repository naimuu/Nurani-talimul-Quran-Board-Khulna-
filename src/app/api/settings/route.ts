import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.boardSettings.findFirst({
      include: {
        contacts: true,
        payments: true,
      }
    });
    
    // If no settings exist yet, return an empty object or create one
    if (!settings) {
      settings = await prisma.boardSettings.create({
        data: {},
        include: {
          contacts: true,
          payments: true,
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    let settings = await prisma.boardSettings.findFirst();
    
    if (settings) {
      // First delete all existing contacts and payments, then create the new ones
      if (data.contacts) {
        await prisma.contactInfo.deleteMany({ where: { boardSettingsId: settings.id } });
      }
      if (data.payments) {
        await prisma.paymentMethod.deleteMany({ where: { boardSettingsId: settings.id } });
      }

      settings = await prisma.boardSettings.update({
        where: { id: settings.id },
        data: {
          name: data.name !== undefined ? data.name : settings.name,
          address: data.address !== undefined ? data.address : settings.address,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl : settings.logoUrl,
          coverUrl: data.coverUrl !== undefined ? data.coverUrl : settings.coverUrl,
          contacts: data.contacts ? {
            create: data.contacts.map((c: any) => ({
              type: c.type,
              value: c.value
            }))
          } : undefined,
          payments: data.payments ? {
            create: data.payments.map((p: any) => ({
              type: p.type,
              provider: p.provider,
              accountName: p.accountName,
              accountNumber: p.accountNumber,
              branch: p.branch,
              routingNo: p.routingNo
            }))
          } : undefined,
        },
        include: {
          contacts: true,
          payments: true,
        }
      });
    } else {
      settings = await prisma.boardSettings.create({
        data: {
          name: data.name,
          address: data.address,
          logoUrl: data.logoUrl,
          coverUrl: data.coverUrl,
          contacts: data.contacts ? {
            create: data.contacts.map((c: any) => ({
              type: c.type,
              value: c.value
            }))
          } : undefined,
          payments: data.payments ? {
            create: data.payments.map((p: any) => ({
              type: p.type,
              provider: p.provider,
              accountName: p.accountName,
              accountNumber: p.accountNumber,
              branch: p.branch,
              routingNo: p.routingNo
            }))
          } : undefined,
        },
        include: {
          contacts: true,
          payments: true,
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

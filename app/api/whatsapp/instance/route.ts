// app/api/whatsapp/instance/route.ts
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // console.log('Received data:', data);

    const existingInstance = await db.whatsAppInstance.findFirst({
      where:{
        teamId: data.teamId,
        agentId: data.agentId,
      }
    })

    let whatsappInstance

    if (existingInstance) {
      // If instance exists, update it
      whatsappInstance = await db.whatsAppInstance.update({
        where: {
          id: existingInstance.id,
        },
        data: {
          instanceName: data.instanceName,
          displayName: data.displayName,
          instanceId: data.instanceId,
          status: data.status,
          apiKey: data.apiKey || null,
          integration: data.integration,
          serverUrl: data.serverUrl,
          webhookUrl: data.webhookUrl,
        },
      });
    } else {
      // If no instance exists, create a new one
      whatsappInstance = await db.whatsAppInstance.create({
        data: {
          instanceName: data.instanceName,
          displayName: data.displayName,
          instanceId: data.instanceId,
          status: data.status,
          apiKey: data.apiKey || null,
          integration: data.integration,
          serverUrl: data.serverUrl,
          webhookUrl: data.webhookUrl,
          team: {
            connect: {
              id: data.teamId,
            },
          },
          agent: {
            connect: {
              id: data.agentId,
            },
          },
        },
      });
    }

    return NextResponse.json(whatsappInstance);
  } catch (error) {
    console.error('Error creating/updating WhatsApp instance:', error);
    return NextResponse.json(
      { error: 'Failed to create/update WhatsApp instance' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const whatsappInstance = await db.whatsAppInstance.update({
      where: {
        instanceId: data.instanceId,
      },
      data: {
        status: data.status,
        ...(data.apiKey && { apiKey: data.apiKey }),
      },
    });

    return NextResponse.json(whatsappInstance);
  } catch (error) {
    console.error('Error updating WhatsApp instance:', error);
    return NextResponse.json(
      { error: 'Failed to update WhatsApp instance' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const agentId = searchParams.get('agentId');

    if (!teamId || !agentId) {
      return NextResponse.json(
        { error: 'Team ID and Agent ID are required' },
        { status: 400 }
      );
    }

    const instance = await db.whatsAppInstance.findFirst({
      where: {
        teamId: teamId,
        agentId: agentId,
      },
    });

    return NextResponse.json(instance);
  } catch (error) {
    console.error('Error fetching WhatsApp instance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp instance' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json()
    
    if (!data) {
      return NextResponse.json(
        { error: 'Instance ID is required' },
        { status: 400 }
      );
    }

    await db.whatsAppInstance.delete({
      where: {
        id: data?.agentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting WhatsApp instance:', error);
    return NextResponse.json(
      { error: 'Failed to delete WhatsApp instance' },
      { status: 500 }
    );
  }
}
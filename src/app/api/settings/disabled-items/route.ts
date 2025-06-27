import { NextRequest, NextResponse } from 'next/server';
import { getDisabledItems, updateDisabledItems } from '@/lib/supabase';

export async function GET() {
  try {
    const disabledItems = await getDisabledItems();
    return NextResponse.json({ disabledItems });
  } catch (error) {
    console.error('Error reading disabled items:', error);
    return NextResponse.json(
      { error: 'Failed to read disabled items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { disabledItems } = body;

    if (!Array.isArray(disabledItems)) {
      return NextResponse.json(
        { error: 'disabledItems must be an array' },
        { status: 400 }
      );
    }

    // Validate that all items are numbers
    if (!disabledItems.every(item => typeof item === 'number')) {
      return NextResponse.json(
        { error: 'All disabled items must be numbers' },
        { status: 400 }
      );
    }

    const success = await updateDisabledItems(disabledItems);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update disabled items' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      disabledItems,
      message: 'Disabled items updated successfully' 
    });
  } catch (error) {
    console.error('Error updating disabled items:', error);
    return NextResponse.json(
      { error: 'Failed to update disabled items' },
      { status: 500 }
    );
  }
} 
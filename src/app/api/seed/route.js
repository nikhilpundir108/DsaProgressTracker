import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seedData';
import dbConnect from '@/lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database reseeded successfully with demo college data',
      result,
    });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

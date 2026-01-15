import { NextResponse } from 'next/server';
import { priceOracle } from '@/lib/dash/price-oracle.js';
import { PLAN_PRICES } from '@/utils/constants.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }

    const planPrice = PLAN_PRICES[plan].usd;
    const pricing = await priceOracle.calculateDashAmount(planPrice);

    return NextResponse.json({
      success: true,
      plan,
      pricing: {
        usd: pricing.usd,
        dash: pricing.dash,
        dashPriceUSD: pricing.dashPriceUSD,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Price API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch price',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

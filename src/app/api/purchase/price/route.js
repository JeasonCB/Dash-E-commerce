import { NextResponse } from 'next/server';
import { priceOracle } from '@/lib/dash/price-oracle.js';
import { PLAN_PRICES } from '@/utils/constants.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');

    // Security: Validate plan exists as own property to prevent prototype pollution
    if (!plan || !Object.hasOwn(PLAN_PRICES, plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line security/detect-object-injection
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
    
    // Security: Do not expose internal error details to client
    return NextResponse.json(
      { 
        error: 'Failed to fetch price',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

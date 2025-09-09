import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { priceCartSchema } from '@/lib/validation/orders';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const body = await request.json();
    const { items, couponCode } = priceCartSchema.parse(body);

    let subtotal = 0;
    const pricedItems = [];

    for (const item of items) {
      const listing = await db.listing.findFirst({
        where: {
          id: item.listingId,
          businessId: actor.businessId,
        },
      });

      if (!listing) {
        return badReq(`Listing ${item.listingId} not found`);
      }

      const itemPrice = listing.price || 0;
      const totalPrice = itemPrice * item.quantity;
      subtotal += totalPrice;

      pricedItems.push({
        ...item,
        unitPrice: itemPrice,
        totalPrice,
        listing: {
          id: listing.id,
          title: listing.title,
          type: listing.type,
        },
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    
    if (couponCode) {
      coupon = await db.coupon.findFirst({
        where: {
          businessId: actor.businessId,
          code: couponCode,
          active: true,
        },
      });

      if (coupon) {
        if (coupon.discountType === 'PCT') {
          discount = subtotal * (coupon.value.toNumber() / 100);
        } else {
          discount = coupon.value.toNumber();
        }
        
        // Don't allow discount to exceed subtotal
        discount = Math.min(discount, subtotal);
      }
    }

    const total = subtotal - discount;

    return ok({
      items: pricedItems,
      subtotal,
      discount,
      total,
      coupon: coupon ? {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
      } : null,
    });
  } catch (error) {
    console.error('Error pricing cart:', error);
    return serverErr('Failed to price cart');
  }
}

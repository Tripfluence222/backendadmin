import crypto from 'crypto';
import { db } from './db';

export function signWebhook(payload: string, secret: string): string {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${signature}`;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signWebhook(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function dispatchWebhook(
  endpointId: string,
  payload: any
): Promise<{ success: boolean; status: number; duration: number; response?: string }> {
  const endpoint = await db.webhookEndpoint.findUnique({
    where: { id: endpointId },
  });

  if (!endpoint || !endpoint.active) {
    throw new Error('Webhook endpoint not found or inactive');
  }

  const payloadString = JSON.stringify(payload);
  const signature = signWebhook(payloadString, endpoint.secret);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TF-Signature': signature,
        'User-Agent': 'Tripfluence-Webhooks/1.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text();

    // Store delivery record
    await db.webhookDelivery.create({
      data: {
        endpointId,
        payload,
        status: response.status,
        duration,
        response: responseText.slice(0, 1000), // Store first 1000 chars
      },
    });

    return {
      success: response.ok,
      status: response.status,
      duration,
      response: responseText.slice(0, 200),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Store failed delivery
    await db.webhookDelivery.create({
      data: {
        endpointId,
        payload,
        status: 0,
        duration,
        response: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export async function dispatchToAllEndpoints(
  businessId: string,
  payload: any
): Promise<Array<{ endpointId: string; success: boolean; status: number }>> {
  const endpoints = await db.webhookEndpoint.findMany({
    where: {
      businessId,
      active: true,
    },
  });

  const results = await Promise.allSettled(
    endpoints.map(endpoint => 
      dispatchWebhook(endpoint.id, payload)
        .then(result => ({
          endpointId: endpoint.id,
          success: result.success,
          status: result.status,
        }))
        .catch(error => ({
          endpointId: endpoint.id,
          success: false,
          status: 0,
        }))
    )
  );

  return results.map(result => 
    result.status === 'fulfilled' ? result.value : result.reason
  );
}

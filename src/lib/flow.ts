import crypto from 'node:crypto';
import { env } from './server';

export interface FlowPaymentParams {
  commerceOrder: string;
  subject: string;
  currency?: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  optional?: Record<string, any>;
  paymentMethod?: number; // 1: Webpay, 2: Servipag, 9: Todos
}

export interface FlowCreateResponse {
  url: string;
  token: string;
  flowOrder: number;
}

export interface FlowStatusResponse {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number; // 1: pendiente, 2: pagada, 3: rechazada, 4: anulada
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: string;
  pending_info?: {
    media: string;
    date: string;
  };
  paymentData?: {
    date: string;
    media: string;
    conversionDate: string;
    conversionRate: number;
    amount: number;
    currency: string;
    fee: number;
    balance: number;
    transferDate: string;
  };
}

export function getFlowConfig() {
  const apiKey = env('FLOW_API_KEY') || '';
  const secretKey = env('FLOW_SECRET_KEY') || '';
  const apiUrl = env('FLOW_API_URL') || 'https://www.flow.cl/api';
  const siteUrl = env('PUBLIC_SITE_URL') || 'https://www.vision-code.cl';

  return { apiKey, secretKey, apiUrl, siteUrl };
}

/**
 * Genera la firma criptográfica HMAC-SHA256 según el protocolo de Flow.cl
 * Ordena las llaves alfabéticamente y concatena key1value1key2value2...
 */
export function signParams(params: Record<string, any>, secretKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  let toSign = '';
  for (const key of sortedKeys) {
    if (key !== 's' && params[key] !== undefined && params[key] !== null) {
      toSign += `${key}${params[key]}`;
    }
  }
  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

/**
 * Crea una orden de pago en Flow.cl y retorna la URL para redirigir al usuario
 */
export async function createFlowPayment(order: FlowPaymentParams): Promise<FlowCreateResponse> {
  const { apiKey, secretKey, apiUrl } = getFlowConfig();

  if (!apiKey || !secretKey) {
    throw new Error('Las credenciales de Flow (FLOW_API_KEY o FLOW_SECRET_KEY) no están configuradas en .env.local');
  }

  const payload: Record<string, any> = {
    apiKey,
    commerceOrder: order.commerceOrder,
    subject: order.subject,
    currency: order.currency || 'CLP',
    amount: Math.round(order.amount),
    email: order.email,
    urlConfirmation: order.urlConfirmation,
    urlReturn: order.urlReturn,
  };

  if (order.optional) {
    payload.optional = JSON.stringify(order.optional);
  }

  if (order.paymentMethod) {
    payload.paymentMethod = order.paymentMethod;
  }

  // Firmar petición
  payload.s = signParams(payload, secretKey);

  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    body.append(k, String(v));
  }

  const res = await fetch(`${apiUrl}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    const errorMsg = data.message || `Error Flow HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as FlowCreateResponse;
}

/**
 * Consulta el estado oficial de una transacción a Flow.cl mediante su token
 */
export async function getFlowPaymentStatus(token: string): Promise<FlowStatusResponse> {
  const { apiKey, secretKey, apiUrl } = getFlowConfig();

  if (!apiKey || !secretKey) {
    throw new Error('Credenciales de Flow no configuradas');
  }

  const params: Record<string, any> = {
    apiKey,
    token,
  };
  params.s = signParams(params, secretKey);

  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    query.append(k, String(v));
  }

  const res = await fetch(`${apiUrl}/payment/getStatus?${query.toString()}`, {
    method: 'GET',
  });

  const data = await res.json();

  if (!res.ok || data.code) {
    const errorMsg = data.message || `Error consultando estado en Flow (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  return data as FlowStatusResponse;
}

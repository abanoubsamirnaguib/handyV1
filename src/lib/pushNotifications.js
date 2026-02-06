import { api } from '@/lib/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function getCurrentPushSubscription() {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/**
 * Ensure a subscription exists and is saved to the backend.
 * - If permission is not granted, it will NOT prompt.
 */
export async function ensurePushSubscriptionSaved() {
  if (!isPushSupported()) return { supported: false };
  if (!window.isSecureContext) return { supported: true, secureContext: false };

  const vapid = await api.getVapidPublicKey();
  
  if (!vapid?.enabled || !vapid?.publicKey) {
    return { supported: true, enabledOnServer: false };
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    if (Notification.permission !== 'granted') {
      return { supported: true, permission: Notification.permission, subscribed: false };
    }

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
    });
  }

  await api.subscribePush(sub.toJSON());
  return { supported: true, enabledOnServer: true, subscribed: true };
}

/**
 * Prompt for notification permission (if needed), then subscribe and save.
 */
export async function requestAndSubscribePush() {
  if (!isPushSupported()) {
    return { supported: false };
  }
  if (!window.isSecureContext) {
    return { supported: true, secureContext: false };
  }

  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    return { supported: true, permission, subscribed: false };
  }

  return ensurePushSubscriptionSaved();
}

export async function unsubscribePush() {
  const sub = await getCurrentPushSubscription();
  
  if (!sub) {
    return { unsubscribed: true, noSubscription: true };
  }

  const endpoint = sub.endpoint;
  
  try {
    await api.unsubscribePush(endpoint);
  } catch (error) {
    console.error('Failed to unsubscribe from backend:', error);
    // Continue anyway to unsubscribe locally
  }

  await sub.unsubscribe();
  return { unsubscribed: true };
}


import OVH from "ovh";

const ovhClient = new OVH({
  appKey: process.env.OVH_APP_KEY!,
  appSecret: process.env.OVH_APP_SECRET!,
  consumerKey: process.env.OVH_CONSUMER_KEY!,
  endpoint: "ovh-eu",
});

export interface DomainAvailability {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
}

export async function checkDomainAvailability(domain: string): Promise<DomainAvailability> {
  try {
    const cartId = await createCart();
    const check = await ovhClient.requestPromised("GET", `/order/cart/${cartId}/domain?domain=${domain}`);
    await deleteCart(cartId);

    return {
      domain,
      available: check.length > 0,
      price: check[0]?.prices?.withTax?.value,
      currency: check[0]?.prices?.withTax?.currencyCode,
    };
  } catch {
    return { domain, available: false };
  }
}

export async function searchDomains(baseName: string, tlds: string[] = [".fr", ".com", ".shop", ".io"]): Promise<DomainAvailability[]> {
  const results: DomainAvailability[] = [];
  for (const tld of tlds) {
    const domain = baseName + tld;
    const availability = await checkDomainAvailability(domain);
    results.push(availability);
  }
  return results;
}

export async function purchaseDomain(domain: string): Promise<{ orderId: string }> {
  const cartId = await createCart();

  // Add domain to cart
  await ovhClient.requestPromised("POST", `/order/cart/${cartId}/domain`, { domain });

  // Checkout
  const order = await ovhClient.requestPromised("POST", `/order/cart/${cartId}/checkout`, {
    autoPayWithPreferredPaymentMethod: true,
  });

  return { orderId: order.orderId?.toString() || cartId };
}

export async function configureDNS(domain: string, vpsIp: string): Promise<void> {
  const zone = domain;

  // A record -> VPS IP
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/record`, {
    fieldType: "A",
    subDomain: "",
    target: vpsIp,
    ttl: 3600,
  });

  // CNAME www -> domain
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/record`, {
    fieldType: "CNAME",
    subDomain: "www",
    target: `${domain}.`,
    ttl: 3600,
  });

  // Refresh zone
  await ovhClient.requestPromised("POST", `/domain/zone/${zone}/refresh`);
}

export async function addTXTRecord(domain: string, value: string): Promise<void> {
  await ovhClient.requestPromised("POST", `/domain/zone/${domain}/record`, {
    fieldType: "TXT",
    subDomain: "",
    target: value,
    ttl: 3600,
  });
  await ovhClient.requestPromised("POST", `/domain/zone/${domain}/refresh`);
}

async function createCart(): Promise<string> {
  const cart = await ovhClient.requestPromised("POST", "/order/cart", {
    ovhSubsidiary: "FR",
  });
  return cart.cartId;
}

async function deleteCart(cartId: string): Promise<void> {
  try {
    await ovhClient.requestPromised("DELETE", `/order/cart/${cartId}`);
  } catch { /* ignore */ }
}

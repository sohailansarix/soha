import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_CURRENCY, CURRENCY_COOKIE } from "./currency";

/** Server-side: read the active currency from the cookie (set by the switcher). */
export async function getActiveCurrency(): Promise<string> {
  const store = await cookies();
  return store.get(CURRENCY_COOKIE)?.value ?? DEFAULT_CURRENCY;
}

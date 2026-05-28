import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

/**
 * The user's wallet is used only to (a) identify them and (b) sign the
 * key-derivation message. It never sends transactions — the app wallet does
 * all Arkiv writes server-side. So any chain works; we default to mainnet for
 * broad wallet compatibility (signMessage is chain-agnostic).
 */
export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

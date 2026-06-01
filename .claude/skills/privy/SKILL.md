---
name: Privy
description: Use when building authentication systems, creating and managing embedded wallets, signing transactions, configuring wallet controls and policies, managing users, or integrating wallet infrastructure into web, mobile, or backend applications. Agents should reach for this skill when users ask about wallet creation, transaction signing, user authentication, access controls, or onchain operations across Ethereum, Solana, and 50+ other blockchains.
metadata:
    mintlify-proj: privy
    version: "1.0"
---

# Privy Skill

## Product summary

Privy is a wallet and authentication infrastructure platform that enables developers to embed wallet functionality and user authentication into applications. It provides client-side SDKs (React, React Native, Swift, Android, Flutter, Unity) for frontend integration and server-side SDKs (Node.js, Java, Go, Rust, Ruby) plus a REST API for backend operations. Privy supports embedded wallets (created and managed by Privy's infrastructure), external wallet connections, and custodial wallets across 50+ blockchains including Ethereum, Solana, Base, and others. Key files: `PrivyProvider` (React setup), `PrivyClient` (server SDK), API endpoints at `https://api.privy.io/v1/`. Primary docs: https://docs.privy.io

## When to use

Reach for this skill when:
- Building user authentication flows (email, SMS, social, wallet-based, passkeys, OAuth)
- Creating or managing embedded wallets for users or applications
- Signing transactions or messages on EVM, Solana, or other chains
- Configuring wallet access controls, ownership models, and authorization keys
- Setting up policies to constrain wallet actions (spending limits, allowlisted recipients, contract interactions)
- Managing user objects, linking accounts, or migrating users from other systems
- Implementing webhooks for transaction or user events
- Building trading apps, treasury management, agent wallets, or fintech applications
- Handling gas sponsorship or wallet funding flows
- Troubleshooting transaction failures, authorization errors, or policy violations

## Quick reference

### SDK Installation & Setup

| Task | Command/Code |
|------|--------------|
| **React setup** | `npm install @privy-io/react-auth` → Wrap app with `<PrivyProvider appId="..." clientId="...">` |
| **React Native** | `npm install @privy-io/expo` → Use `PrivyProvider` with same config |
| **Node.js** | `npm install @privy-io/node` → `new PrivyClient({appId, appSecret})` |
| **Go** | `go get github.com/privy-io/privy-go` → `privy.NewPrivyClient(...)` |
| **REST API** | POST to `https://api.privy.io/v1/` with Basic auth: `app-id:app-secret` |

### Core API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/wallets` | Create a wallet (server or user-owned) |
| `GET /v1/wallets/{id}` | Fetch wallet details |
| `POST /v1/wallets/{id}/rpc` | Sign message or send transaction (EVM/Solana) |
| `POST /v1/users` | Create a user with linked accounts |
| `GET /v1/users/{id}` | Fetch user by ID |
| `POST /v1/policies` | Create a policy to constrain wallet actions |
| `POST /v1/key-quorums` | Create a key quorum for multi-sig authorization |

### Common Wallet Ownership Models

| Model | Owner | Use Case | Control |
|-------|-------|----------|---------|
| **User-owned** | User ID | Self-custodial consumer wallets | User has full control |
| **User + server** | User + authorization key | Automated trading, limit orders | User owns, server has scoped permissions |
| **App-owned** | Authorization key | Treasury, trading bots, agents | Application backend controls |
| **Custodial** | Licensed custodian | FBO banking model | Custodian operates on behalf of user |

### Authentication Methods (Privy-managed)

- Email/SMS/WhatsApp (OTP-based)
- Social: Google, Discord, Twitter, Farcaster, Telegram, Spotify, Twitch, Instagram, GitHub
- Crypto-native: MetaMask, Phantom, Farcaster, Telegram
- Passkeys & biometric
- Custom OAuth
- Guest accounts

## Decision guidance

### When to use embedded wallets vs external wallets

| Scenario | Embedded | External |
|----------|----------|----------|
| New users without wallets | ✓ | ✗ |
| Seamless onboarding UX | ✓ | ✗ |
| Users bring existing wallets | ✗ | ✓ |
| Power users / crypto-native | ✗ | ✓ |
| Full app control needed | ✓ | ✗ |
| User self-custody preferred | ✓ (with export) | ✓ |

### When to use Privy authentication vs JWT-based auth

| Scenario | Privy Auth | JWT-based |
|----------|-----------|-----------|
| No existing auth system | ✓ | ✗ |
| Need multiple login methods | ✓ | ✗ |
| Already have auth provider | ✗ | ✓ |
| Want Privy to manage sessions | ✓ | ✗ |
| Integrating with existing system | ✗ | ✓ |

### When to use policies vs manual approvals

| Scenario | Policies | Manual Approvals |
|----------|----------|-----------------|
| Automated enforcement | ✓ | ✗ |
| Spending limits | ✓ | ✗ |
| Allowlisted recipients | ✓ | ✗ |
| Human review required | ✗ | ✓ |
| Sensitive operations | ✗ | ✓ |

## Workflow

### 1. Create a wallet (server-side)

1. **Obtain credentials**: Get `appId` and `appSecret` from Privy Dashboard
2. **Initialize client**: Create `PrivyClient` with credentials
3. **Create wallet**: Call `wallets().create({chain_type: 'ethereum'})` or specify owner
4. **Store wallet ID**: Save returned `id` for future operations
5. **Verify**: Check wallet address on block explorer

### 2. Authenticate a user and create their wallet (client-side)

1. **Wrap app**: Ensure `PrivyProvider` wraps your app with `appId` and `clientId`
2. **Enable auto-creation**: Set `embeddedWallets.ethereum.createOnLogin: 'users-without-wallets'` in config
3. **Trigger login**: Call `login()` from `usePrivy()` hook
4. **User authenticates**: User completes email/social/wallet login
5. **Wallet auto-created**: Privy creates wallet and links to user
6. **Access wallet**: Use `useWallets()` hook to get wallet object

### 3. Send a transaction

1. **Get wallet**: Retrieve wallet ID (from user or server)
2. **Prepare transaction**: Build transaction object with `to`, `value`, `data` fields
3. **Call API**: Use `sendTransaction()` (client) or `eth_sendTransaction` RPC (server)
4. **Sign & broadcast**: Privy signs in secure enclave and broadcasts to network
5. **Get hash**: Receive transaction hash and Privy transaction ID
6. **Monitor**: Subscribe to webhooks or poll transaction status

### 4. Configure a policy

1. **Define rules**: Specify what actions are allowed (e.g., max transfer amount, allowlisted addresses)
2. **Create policy**: POST to `/v1/policies` with rules for each RPC method
3. **Attach to wallet**: Include `policy_ids` when creating wallet or update wallet
4. **Test**: Send test transaction to verify policy enforcement
5. **Monitor violations**: Check error responses for `policy_violation` errors

### 5. Set up authorization keys for server control

1. **Generate keypair**: Use `generateP256KeyPair()` from Node SDK
2. **Store private key**: Save securely (environment variable, secrets manager)
3. **Register public key**: Create authorization key in Dashboard or via API
4. **Create wallet**: Specify public key as owner when creating wallet
5. **Sign requests**: Include `privy-authorization-signature` header when calling wallet APIs
6. **Verify**: Test that only signed requests succeed

## Common gotchas

- **Missing `PrivyProvider`**: All React hooks require the app to be wrapped with `PrivyProvider`. If you get "usePrivy must be used within PrivyProvider", check your component tree.
- **Wallet not auto-created**: Set `createOnLogin: 'users-without-wallets'` in config. Default is `'off'`.
- **Policy denies all requests**: If no rules match an RPC method, policy defaults to `DENY`. Always include a rule for each RPC method you use, or add a catch-all `{method: '*', conditions: [], action: 'ALLOW'}` rule.
- **Authorization signature errors**: Ensure you're signing the correct payload (request body + headers). Use `AuthorizationContext` in Node SDK to auto-handle signing.
- **Insufficient funds**: Check wallet balance on block explorer. For gas sponsorship, verify credits in Dashboard.
- **User session keys expired**: User signing keys are time-bound. Request fresh keys via `/wallets/authenticate` endpoint.
- **Rate limits (HTTP 429)**: Implement exponential backoff. Batch requests where possible.
- **Idempotency**: Include `idempotency_key` header to prevent duplicate transactions on retries.
- **Chain mismatch**: Ensure `caip2` and `chain_type` match the network you're targeting (e.g., `eip155:11155111` for Sepolia).
- **External wallet not connected**: Users must approve wallet connection in their wallet app. Check `useWallets()` to see connected wallets.

## Verification checklist

Before submitting work with Privy:

- [ ] Wallet created successfully and address is valid
- [ ] User authenticated and linked to wallet
- [ ] Transaction signed and broadcasted (check hash on block explorer)
- [ ] Policy rules cover all RPC methods the wallet will use
- [ ] Authorization keys properly generated and stored securely
- [ ] Webhooks configured and receiving events (test in Dashboard)
- [ ] Error handling in place for `policy_violation`, `insufficient_funds`, `request_expired`
- [ ] Idempotency keys included for critical operations
- [ ] Gas sponsorship credits available (if using gas sponsorship)
- [ ] Rate limiting handled with exponential backoff
- [ ] No hardcoded secrets (use environment variables)
- [ ] Tested on testnet before production deployment

## Resources

- **Comprehensive navigation**: https://docs.privy.io/llms.txt (page-by-page index for all docs)
- **API Reference**: https://docs.privy.io/api-reference/introduction
- **Key Concepts**: https://docs.privy.io/basics/key-concepts
- **Controls & Policies**: https://docs.privy.io/controls/overview

---

> For additional documentation and navigation, see: https://docs.privy.io/llms.txt
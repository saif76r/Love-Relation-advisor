# Security Specification for Amour Vault Firestore

Consistent with Zero-Trust Secure Architecture, this document defines data invariants, vulnerabilities tested, and the rules of access validation.

## 1. Data Invariants

1. **User Ownership Match**: A user can only access, write, modify, or delete documents residing within their own `/users/{userId}` subtree.
2. **Strict Document ID Formats**: All Document IDs used in single write requests must be well-formed alphanumeric strings matching `^[a-zA-Z0-9_\-]+$` of length `<= 128`.
3. **Temporal Integrity**: Create and update transactions must bind their metadata timestamp fields strictly to `request.time`. Client-supplied past or future timestamps are explicitly blocked.
4. **Valid Type & Size Enforcements**: All payloads must confirm exact string, integer, or array structures conforming to `firebase-blueprint.json` limits before write permission is granted.

---

## 2. The "Dirty Dozen" Payloads (Abridged Spec Cases)

Below are twelve invalid payloads drafted during threat modeling to verify permission blocks on unauthorized or malformed data modifications:

1. **Identity Spoofing - Profile Injection**: User `attacker` attempts to create or update profile document `/users/victim_id`.
2. **ID Poisoning Attack**: User attempts to create a document with high-entropy or overflow characters (`/users/me/chatHistory/invalid%#$&*-too-long-id`).
3. **Privilege Escalation**: Modifying role variables or forcing a system-only generated insight flag.
4. **Malicious Empty Fields**: Creating an entity with empty or skipped required keys.
5. **Denial-of-Wallet Field Overflow**: Triggering resource exhaustion by sending a 20MB nested array or string.
6. **Past/Future Temporal Injection**: Writing a legacy timestamp in a create payload to spoof older history.
7. **Type Coercion Vulnerability**: Supplying an integer where a string is expected for `partner1`.
8. **Invalid Enum Values**: Setting `userMode` to `"poly"` instead of `"single"` or `"couple"`.
9. **Blanket Query Scraping**: Attempting a list query on all users without binding the query filtering to the user's authenticated ID.
10. **Shadow Key Infiltration**: Injecting an invisible key (e.g., `{ isPremium: true }`) during basic profile update.
11. **Bypassing Parent Gates**: Attempting to write child journals without a corresponding parent `/users/{userId}` document existing.
12. **Status Shortcutting**: Directly writing fully-resolved insights without going through proper client API structures.

All these cases are strictly mitigated by our custom Firestore rules.

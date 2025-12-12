# Firebase Security & Encryption Guide

## Current Security Status

### What Firebase Provides by Default:

1. **Transport Layer Security (TLS/SSL)**
   - ✅ All data in transit is encrypted (HTTPS)
   - ✅ Firestore uses encrypted connections
   - ✅ Storage uses encrypted connections

2. **Authentication & Authorization**
   - ✅ Firebase Auth provides secure authentication
   - ✅ Security rules control who can read/write data
   - ✅ Each user only accesses their own data

3. **Data at Rest**
   - ✅ Firestore encrypts data at rest with Google-managed keys
   - ✅ Firebase Storage encrypts files at rest
   - ⚠️ BUT: Sensitive data like phone numbers are still readable by Firebase admins

## The Problem with Sensitive Data

**Phone numbers, triggers, and personal information** should be encrypted so that:
- Even Firebase admins can't read them
- Even if your database is breached, the data is useless
- Only the user can decrypt their own data

## Solutions for End-to-End Encryption

### Option 1: Client-Side Encryption (Recommended for your use case)

**How it works:**
1. User enters sensitive data on the app
2. Before sending to Firestore, encrypt it with a key
3. Store encrypted data in Firestore
4. When user signs in, decrypt the data with their password/key

**Implementation:**

```typescript
// utils/encryption.ts
import CryptoJS from 'crypto-js';

/**
 * Encrypt sensitive data using user's password as key
 * @param data - The data to encrypt
 * @param encryptionKey - Secret key (user's password or derived key)
 * @returns Encrypted string
 */
export const encryptData = (data: string, encryptionKey: string): string => {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
};

/**
 * Decrypt sensitive data
 * @param encryptedData - The encrypted string
 * @param encryptionKey - Secret key (user's password or derived key)
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string, encryptionKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

**Installation:**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

**Usage in Account Setup:**

```typescript
// In accountSetup.tsx handleSubmit()
const sensitiveData = {
  phone: formData.phone,
  age: formData.age,
};

// Get encryption key from user's password (stored in state during signup)
const encryptionKey = userPassword; // or derive from user's auth token

const profileData = {
  userId: user.uid,
  email: user.email,
  displayName: user.displayName,
  // Encrypt sensitive fields
  phone: encryptData(formData.phone, encryptionKey),
  age: formData.age ? encryptData(formData.age, encryptionKey) : null,
  // Don't encrypt non-sensitive data
  bio: formData.bio,
  preferences: formData.preferences,
  triggers: selectedTriggers.map(t => encryptData(t, encryptionKey)),
  setupCompleted: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

await addDoc(usersCollectionRef, profileData);
```

### Option 2: Use Firebase Extensions

Firebase has an official encryption extension:
- **Firestore Encrypt** extension
- Can automatically encrypt/decrypt specific fields
- Requires additional setup and pricing

### Option 3: Use Passwordless Key Derivation

Instead of the user's password, derive a unique key:

```typescript
// utils/keyDerivation.ts
import { auth } from '../firebase/firebase';

/**
 * Derive a unique encryption key for the user
 * Based on their Firebase Auth UID
 */
export const deriveEncryptionKey = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user authenticated');
  
  const token = await user.getIdToken();
  return token.substring(0, 32); // Use first 32 chars as key
};
```

## Recommended Implementation for Your App

### Step 1: Install Crypto Library
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

### Step 2: Create Encryption Utils
Create `src/utils/encryption.ts` with encryption/decryption functions

### Step 3: Update Account Setup

Encrypt phone number and triggers before storing:
- Phone: Encrypt with user's password or derived key
- Triggers: Encrypt each trigger individually
- Age: Encrypt (it's PII)
- Bio/Preferences: Keep unencrypted (less sensitive)

### Step 4: Update Profile Helpers

When retrieving data, decrypt sensitive fields:
```typescript
export const getUserProfile = async (password: string) => {
  // ... get document ...
  const data = doc.data();
  
  return {
    phone: decryptData(data.phone, password),
    age: data.age ? decryptData(data.age, password) : null,
    triggers: data.triggers.map(t => decryptData(t, password)),
    // ... other fields ...
  };
};
```

## Security Best Practices

### DO:
- ✅ Encrypt phone numbers
- ✅ Encrypt triggers (mental health topics)
- ✅ Encrypt age
- ✅ Use HTTPS only (Firebase does this)
- ✅ Use strong passwords (Firebase Auth handles this)
- ✅ Implement rate limiting on signup
- ✅ Never log sensitive data to console (remove console.logs in production)
- ✅ Use Firestore security rules to prevent unauthorized access

### DON'T:
- ❌ Store passwords (Firebase Auth handles this)
- ❌ Send sensitive data in URLs
- ❌ Expose encryption keys in code
- ❌ Use weak encryption algorithms
- ❌ Store unencrypted PII in Firestore

## Firestore Security Rules for Sensitive Data

Update your rules to be more restrictive:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /Users/{userId} {
      // Only the owner can read their own data
      allow read: if request.auth.uid == userId;
      
      // Only the owner can write to their own data
      allow write: if request.auth.uid == userId;
      
      // Prevent list queries on Users collection
      allow list: if false;
    }
  }
}
```

## Compliance Considerations

If you handle healthcare data (which you do - mental health):
- Consider **HIPAA compliance** (if US based)
- Consider **GDPR compliance** (if EU users)
- Encryption helps meet compliance requirements

## Summary

| Data Field | Encrypt? | Method | Why |
|-----------|----------|--------|-----|
| Phone | ✅ YES | Client-side AES | PII, highly sensitive |
| Age | ✅ YES | Client-side AES | PII |
| Triggers | ✅ YES | Client-side AES | Mental health data |
| Bio | ⚠️ MAYBE | Optional | Less sensitive, user choice |
| Preferences | ⚠️ MAYBE | Optional | Less sensitive, user choice |
| Email | ❌ NO | Plain text | Needed for auth, Firebase handles it |
| Profile Picture | ⚠️ MAYBE | TLS only | Encrypted in transit, depends on policy |

## Implementation Priority

1. **High Priority**: Encrypt phone numbers and triggers
2. **Medium Priority**: Encrypt age
3. **Low Priority**: Encrypt bio/preferences
4. **Always**: Update security rules to prevent unauthorized access

## Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/firestore/security/get-started)
- [CryptoJS Documentation](https://cryptojs.gitbook.io/docs/)
- [OWASP Encryption Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

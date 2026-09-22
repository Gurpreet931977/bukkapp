# BUKKAPP Firebase Integration & Connection Guide

This document provides a step-by-step walkthrough to connect BUKKAPP with Google Firebase for Authentication, Cloud Firestore, and Cloud Storage.

---

## 1. Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `bukkapp-production` (or your preferred name).
3. (Optional) Enable or disable Google Analytics depending on preference, then click **Create project**.

---

## 2. Register Your Web App

1. On the project overview page, click the **Web icon (`</>`)** to add a web app.
2. Enter App nickname: `BUKKAPP Web`.
3. Click **Register app**.
4. Firebase will display your `firebaseConfig` object containing:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## 3. Configure Local Environment Variables

Create or update your `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="bukkapp-prod.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="bukkapp-prod"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="bukkapp-prod.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef"
```

*Note: BUKKAPP is architected with graceful fallback. If these variables are left empty, the application automatically runs in persistent local store mode without throwing runtime errors.*

---

## 4. Enable Authentication

1. In the Firebase console left navigation, click **Build** -> **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab:
   - Click **Email/Password**, toggle **Enable**, and click **Save**.
   - (Optional) Enable **Google** sign-in for 1-click social logins.

---

## 5. Enable Cloud Firestore Database

1. In the left navigation, click **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose a database location closest to your users (e.g. `asia-south1` for Mumbai / Dehradun, India).
4. Start in **Production mode**.
5. Click **Create**.

### Recommended Firestore Security Rules

Navigate to the **Rules** tab in Firestore and replace with the following role-based rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to fetch user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Check if user is Master Admin
    function isAdmin() {
      return request.auth != null && getUserData().role == 'admin';
    }
    
    // Check if user is Business Owner of the specific business
    function isBusinessOwner(bizId) {
      return request.auth != null && (
        getUserData().businessId == bizId || isAdmin()
      );
    }

    // USERS COLLECTION
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // BUSINESSES COLLECTION
    match /businesses/{bizId} {
      // Anyone can view active businesses
      allow read: if resource.data.status == 'active' || isBusinessOwner(bizId);
      // Owners can update their business; Admins can manage all
      allow update: if isBusinessOwner(bizId);
      allow create, delete: if isAdmin();
    }

    // SERVICES COLLECTION
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isBusinessOwner(request.resource.data.businessId);
    }

    // BOOKINGS COLLECTION
    match /bookings/{bookingId} {
      // Customers read their own; Merchant reads bookings for their business; Admin reads all
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        isBusinessOwner(resource.data.businessId)
      );
      // Anyone can create a booking with valid customer data
      allow create: if true;
      // Merchant or Admin can update status (confirm, complete, cancel)
      allow update: if isBusinessOwner(resource.data.businessId);
    }

    // REVIEWS COLLECTION
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if isBusinessOwner(resource.data.businessId);
      allow delete: if isAdmin();
    }

    // AUDIT LOGS COLLECTION
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if true;
    }
  }
}
```

---

## 6. Testing the Connection

1. Start your local development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000/login](http://localhost:3000/login).
3. If Firebase configuration is supplied, BUKKAPP will authenticate via Firebase Auth.
4. If running locally without credentials, BUKKAPP smoothly handles sessions through its internal resilient store.

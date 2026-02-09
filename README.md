# 🏆 SteamQuest

**SteamQuest** is a community-driven mobile application designed for gamers to create, share, and discover achievement guides. Built with React Native and Expo, it provides a sleek, "Steam-inspired" interface for tracking game completion goals.

## ✨ Features

**User Authentication**:  Complete secure flow powered by Firebase with:
* User Registration: Secure account creation using email and password with real-time form validation.
* Login System: Authenticated sign-in with proper error handling and session management.
* Email Verification: Automated verification emails to confirm user identity before granting full access.
* Password Reset: Secure password recovery system via email reset link.
* Persistent Authentication: Maintains user login state across app sessions.
* Protected Routes & Access Control: Restricts access to authorized users only.
* Secure Data Handling: Firebase-backed encryption and token-based authentication for enhanced security.

**Guide Creation**: Share your gaming expertise by creating detailed guides with:
* Game title and achievement name.
* Difficulty ratings (Easy to Very Hard).
* Platform selection (PC, PlayStation, Xbox, Switch).
* Estimated time for completion.
* Rich text content and cover image uploads.

**Search & Discovery**: Find existing guides quickly through an interactive system with:
* Real-Time Search: Instant results displayed as users type.
* Game Title Suggestions: Auto-complete recommendations based on available guides.
* Keyword Matching: Search by game name, achievement title, or related terms.
* Responsive Interface: Smooth and optimized experience across all devices.
  
**Native Experience**:
* Optimized for Android and iOS.
* Haptic feedback and smooth navigation transitions.
* Custom double-press back exit for Android users.

## 🛠️ Tech Stack

* **Framework**: [Expo](https://expo.dev/) (React Native).
* **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing).
* **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native).
* **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore).
* **Image Handling**: Expo Image Picker & Expo Image.

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS)
* [Expo Go](https://expo.dev/go) app on your mobile device or an emulator (Android Studio/Xcode)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Sumuditha-Janith/SteamQuest.git
cd SteamQuest

```


2. **Install dependencies**:
```bash
npm install

```
3. **Create and Add Firebase Config**:
Inside the SteamQuest/services/firebaseConfig.ts file, configure Firebase as follows:
```text
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
> [!IMPORTANT]
> This repository currently contains hardcoded Firebase credentials for demonstration purposes. And it is not recommended.

> **Risks:**
> * **Bot Scrapers:** Automated scripts constantly scan GitHub for keys to abuse cloud resources, which can lead to unexpected billing or project suspension.
> * **Security Best Practices:** Hardcoding secrets is a critical security vulnerability. In a professional environment, this can lead to data breaches and account compromises.

> [!TIP]
>  **Recommended Fix:** Always use Environment Variables (`.env`) and ensure they are added to your `.gitignore`.

To keep API keys secure and allow for different configurations (Development vs. Production), this project uses environment variables. 

### 3.2-A. Setup .env file
Create a `.env` file in the root directory of the project and add your Firebase credentials using the `EXPO_PUBLIC_` prefix (this ensures Expo can access them):

```text
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```
### 3.2-B. Implementation
In the source code, these variables are accessed via process.env. This prevents hardcoding sensitive information directly into the repository:
```text
// Example usage in services/firebaseConfig.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ...
};
```
> [!IMPORTANT]
> Never commit your .env file to version control. Ensure that .env is added to your .gitignore file to protect your credentials.

4. **Configure Firebase Rules**:
Create a FireStore Database [From Here](https://console.firebase.google.com/) And add these rules.
```text
//Firestore rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - each user can only access their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Guides collection
    match /guides/{guideId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if 
        request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if 
        request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Fallback for any other documents (temporary)
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 1);
    }
  }
}

```


4. **Start the project**:
```
npx expo start

```


Scan the QR code with **Expo Go** (Android) or your **Camera app** (iOS).

## 📂 Project Structure

```text
SteamQuest/
├── app/                  # Expo Router - File-based navigation
│   ├── (auth)/           # Authentication screens (Login, Register, etc.)
│   ├── (dashboard)/      # Main app screens (Home, Create Guide, Settings)
│   └── _layout.tsx       # Root layout configuration
├── components/           # Reusable UI components
├── context/              # Context API (AuthContext)
├── services/             # API and Database logic (guideService)
├── utils/                # Helper functions (backHandler, etc.)
└── assets/               # Images, icons, and fonts 
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Developed with ❤️ for the gaming community.**

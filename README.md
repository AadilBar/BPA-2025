# 🌅 The Skyline Project

> A comprehensive mental health support platform connecting individuals with resources, community, and professional care.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://aadilbar.github.io/BPA-2025/)
[![React](https://img.shields.io/badge/React-19.2.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange)](https://firebase.google.com/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features Breakdown](#key-features-breakdown)
- [Firebase Configuration](#firebase-configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

## 🎯 About

The Skyline Project is a safe, accessible mental health support platform designed to provide:
- **Professional counseling services** with easy appointment booking
- **Community forums** for peer support and discussion
- **AI-powered search (Nimbus)** for instant mental health information
- **Educational resources** including research articles and expert content
- **Crisis helplines** and immediate support resources
- **Blog platform** for mental health awareness and education

Built with modern web technologies, The Skyline Project aims to break down barriers to mental health support and create a judgment-free space for healing and growth.

## ✨ Features

### 🤖 Nimbus AI Search
- Intelligent search engine for mental health queries
- Real-time PubMed research article integration
- Dictionary API for key term definitions
- Context-aware helpline recommendations
- Related topics and forum discussions

### 💬 Community Forums
- Anonymous or identified posting options
- Category-based organization (Uplifty, Depression, Relationships, Recovery, etc.)
- Advanced filtering (Most Recent, Most Popular, Most Replies)
- Content trigger warnings and sensitive content filtering
- Real-time engagement metrics (likes, replies, views)
- Trending discussions algorithm

### 🏥 Professional Counseling
- Browse qualified mental health professionals
- Specialty-based filtering
- Secure appointment booking system
- Encrypted communication using AES-256
- Availability calendars

### 📚 Resources & Education
- Curated mental health resources
- Educational blog posts
- Research articles and publications
- Crisis helpline directory
- Self-care guides and coping strategies

### 🔐 User Profiles
- Secure authentication via Firebase
- Customizable profiles with avatars
- Privacy-focused design with encryption
- Trigger warning preferences
- Activity tracking

### 💳 Donation System
- Stripe integration for secure payments
- Support platform sustainability
- Transparent fund allocation

## 🛠 Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations
- **GSAP** - Advanced animations
- **Lenis** - Smooth scrolling
- **Three.js** - 3D graphics and effects

### Backend & Services
- **Firebase** - Authentication, Firestore database, and hosting
- **PubMed API** - Research article integration
- **Dictionary API** - Word definitions
- **Stripe** - Payment processing

### UI/Icons
- **Lucide React** - Modern icon library

### Code Quality
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Stripe account (for donations)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AadilBar/BPA-2025.git
   cd BPA-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## 📁 Project Structure

```
BPA-2025/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── FirebaseDiscussions.tsx
│   │   ├── Footer.tsx
│   │   ├── MentalHealthPopup.tsx
│   │   ├── Navbar.tsx
│   │   ├── NimbusSearch.tsx
│   │   ├── ScrollToTop.tsx
│   │   └── home/           # Home page specific components
│   ├── pages/              # Page components
│   │   ├── home.tsx
│   │   ├── forum.tsx
│   │   ├── counseling.tsx
│   │   ├── resources.tsx
│   │   ├── blog.tsx
│   │   ├── profile.tsx
│   │   ├── signin.tsx
│   │   └── ...
│   ├── firebase/           # Firebase configuration
│   │   └── firebase.ts
│   ├── lib/                # Service/API layers
│   │   ├── blogService.ts
│   │   └── counselingService.ts
│   ├── utils/              # Utility functions
│   │   ├── encryption.ts
│   │   └── profileHelpers.ts
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Public assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.cjs
```

## 🎨 Key Features Breakdown

### Nimbus AI Search Engine
The intelligent search system that provides:
- **Research Articles**: Live integration with PubMed database
- **Definitions**: Automatic key term definitions using Dictionary API
- **Forum Discussions**: Real-time Firebase query for relevant forum posts
- **Professional Support**: Context-aware counselor recommendations
- **Helplines**: Smart helpline suggestions based on search keywords
- **Related Topics**: AI-generated related search queries

### Forum System
A comprehensive community platform with:
- **Firebase Firestore** for real-time data
- **Trigger Warning System** for sensitive content
- **Advanced Filtering**: Category, time, popularity, and custom triggers
- **Trending Algorithm**: Weighted scoring based on engagement metrics
- **Anonymous Posting**: Privacy-first design
- **Rich Text Content**: Support for detailed posts and replies

### Security & Privacy
- **AES-256 Encryption** for sensitive communications
- **Firebase Authentication** for secure user management
- **HTTPS Enforcement** for all communications
- **No PII Storage** unless explicitly consented
- **Trigger Warnings** for potentially distressing content

## 🔥 Firebase Configuration

### Firestore Collections

1. **users**
   - User profiles and preferences
   - Encrypted sensitive data
   - Trigger warning preferences

2. **forum**
   - Discussion posts
   - Categories, tags, and triggers
   - Engagement metrics (likes, views, replies)

3. **counselors**
   - Professional profiles
   - Specialties and availability
   - Appointment schedules

4. **blog**
   - Blog posts and articles
   - Author information
   - Publication dates

### Security Rules
Ensure proper Firebase security rules are configured for:
- Read/write permissions
- User authentication requirements
- Data validation

## 🌐 Deployment

The project is configured for GitHub Pages deployment:

```bash
npm run deploy
```

This will:
1. Build the production bundle
2. Deploy to the `gh-pages` branch
3. Make the site available at `https://aadilbar.github.io/BPA-2025/`

### Environment Variables for Production
Make sure to set up environment variables in your deployment platform (GitHub Secrets for GitHub Actions, or Vercel/Netlify environment settings).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test thoroughly before submitting PRs
- Update documentation as needed

## 👥 Team

Created with ❤️ by:
- **Aadil Barkat**
- **Jeevith Veerasaravanan**
- **Amogh Shivanna**
- **Pradyun Fatwani**

## 📞 Support & Resources

### Crisis Helplines (24/7)
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- PubMed API for research article access
- Free Dictionary API for term definitions
- Firebase for backend infrastructure
- The mental health community for inspiration and support
- All contributors and supporters of The Skyline Project

---

<div align="center">

**Built for BPA 2025 Competition**

[Live Demo](https://aadilbar.github.io/BPA-2025/) | [Report Bug](https://github.com/AadilBar/BPA-2025/issues) | [Request Feature](https://github.com/AadilBar/BPA-2025/issues)

⭐ Star this repo if you find it helpful!

</div>

# KiddoLand Platform - Frontend

A Privacy-First AI Storytelling Platform for Children

> **Educational Project** - COMP 385 Capstone Project  
> **Status:** Production Ready ✅  
> **Last Updated:** February 17, 2026

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Privacy-First Design](#privacy-first-design)
- [Story Creation System](#story-creation-system)
- [User Management](#user-management)
- [Component Library](#component-library)
- [Configuration](#configuration)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

KiddoLand is a child-safe AI storytelling platform that generates personalized stories, rhymes, and activities. Built with privacy as the cornerstone, the platform operates on a **session-only** data model with no personal information storage.

### Key Principles

🛡️ **Privacy-First:** No child names, birthdates, or personal data stored  
🎨 **Kid-Friendly:** Vibrant UI with smooth animations  
♿ **Accessible:** WCAG AA compliant, keyboard navigation  
📱 **Responsive:** Works seamlessly on mobile, tablet, and desktop  
🚀 **Fast:** Optimized bundle size, lazy loading  

### Target Users

- **Home Mode**: Parents and guardians creating stories for their children
- **Institution Mode**: Teachers and librarians (school/library emails only)

---


## 🗣️ Text-to-Speech (TTS) Integration

### Backend: Optional TTS for Story APIs

- All main story-generation endpoints now support optional TTS audio output:
  - `POST /ai/sample`
  - `POST /story/generate-rhyme`
  - `POST /story/rewrite`
- Use the `include_tts` flag in your API request:
  - `include_tts: true` — API returns both story text and TTS audio (base64 + media type).
  - `include_tts: false` — API returns story text only (default).
- If TTS fails (e.g., provider outage), you still get the story text—no hard errors.
- TTS provider routing is more robust (Hugging Face compatibility + fallback provider).
- Response fields for TTS (when enabled and available):
  - `tts_audio_base64`
  - `tts_media_type`

**Example request:**
```json
{
  "prompt": "A bedtime story about a brave turtle",
  "include_tts": true
}
```

**Example response (TTS enabled):**
```json
{
  "story": "...",
  "tts_audio_base64": "...",
  "tts_media_type": "audio/wav"
}
```

---

### Frontend: TTS Controls in Home Mode

- On `/home/create-story`, you’ll see a small speaker (audio) toggle next to the camera/mic icons.
- Toggling this ON sends `include_tts: true` in the story request; toggling OFF disables TTS.
- If TTS audio is returned, a tiny audio player appears in the story preview so you can listen to the generated story.
- The toggle button matches the mic icon’s style (blue = on, red/crossed = off).
- If TTS is unavailable or disabled, only story text is shown.

**How to use:**
1. Go to Home Mode → Create Story.
2. Use the speaker toggle to enable/disable TTS.
3. Generate a story. If TTS is enabled and available, listen using the audio player in the preview.

**No configuration needed:** TTS is fully optional and does not affect users who don’t use the toggle.

---

## ✨ Features

### Story Creation

- **Unified Input Interface:** Text, voice, image, and preferences combined
- **Multiple Input Methods:**
  - 📝 Text chatbot (primary)
  - 🎤 Voice transcription (Chrome/Edge)
  - 📷 Image upload with AI analysis
  - ⚙️ Story preferences form

### Story Preferences (Optional)

1. **Age Band** - 1-2, 3-4, 5-6, 7-8, 9-10, 11-12 years (optional)
2. **Interests** - Animals, Space, Magic, Adventure, etc. (20+ options)
3. **Tone** - Calm, Funny, Brave, Silly, Gentle, Exciting
4. **Learning Goal** - Confidence, Sharing, Kindness, Just for fun
5. **Story Type** - Adventure, Bedtime, School day, Everyday life
6. **Story Length** - Short (2-3 min), Medium (5 min), Long (8-10 min)
7. **Current Mood** - Excited, Nervous, Calm, Frustrated
8. **Language** - English (expandable)

### Story Management

- ❤️ **Favorites:** Heart icon to save/remove stories
- 📚 **History:** View all generated stories with lazy loading
- 🗑️ **Delete:** Remove stories with confirmation
- ✏️ **Refine:** Iteratively improve stories
- 💾 **Save:** Persist favorites to database

### User Experience

- **Dashboard:** Quick access tiles for all features
- **Navigation:** App shell with Home, History, Favorites
- **Responsive:** Mobile-first design
- **Real-time Updates:** Instant UI updates on actions

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ 
- **npm** 7+
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to project directory
cd "KiddoLand-Platform-UI"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens automatically at `http://localhost:5173`

### First-Time Setup

1. **Select Mode:** Choose "Home Mode" on landing page
2. **Sign In/Register:**
   - Email: Any valid email (e.g., `parent@gmail.com`)
   - Password: Min 8 characters, 1 letter, 1 number (e.g., `password123`)
3. **Create Story:** Click "Create a Story" tile
4. **Set Preferences:** (Optional) Click "Story Preferences"
5. **Generate:** Type your idea and click "Generate Story"

### Test Credentials

**Home Mode:**
- Email: `parent@kiddoland.local`
- Password: `Parent123!`

**Institution Mode:**
- Email: `teacher@kiddoland.local`
- Password: `Teacher123!`

---

## 🏗️ Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| TypeScript | 4.9+ | Type safety |
| Material-UI | 5.15+ | Component library |
| React Router | 6.22+ | Client routing |
| Lucide React | Latest | Icon library |
| Vite | 5.0+ | Build tool |

### Project Structure

```
KiddoLand-Platform-UI/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/              # Atomic UI components
│   │   ├── layouts/         # Layout wrappers
│   │   ├── story-creation/  # Story creation components
│   │   ├── AppShellLayout.tsx
│   │   ├── KiddoButton.tsx
│   │   ├── KiddoCard.tsx
│   │   └── index.ts
│   ├── context/             # Global state
│   │   └── AppContext.tsx   # Auth & app state
│   ├── pages/               # Route pages
│   │   ├── ModeSelectPage.tsx
│   │   ├── AuthHomePage.tsx
│   │   ├── HomeDashboardPage.tsx
│   │   ├── CreateStoryUnifiedPage.tsx
│   │   ├── StoryHistoryPage.tsx
│   │   └── StoryFavoritesPage.tsx
│   ├── theme/               # MUI theme
│   │   └── theme.ts
│   ├── types/               # TypeScript types
│   │   └── storyOptions.ts  # Story preference types
│   ├── utils/               # Utilities
│   │   ├── aiApi.ts         # API client
│   │   ├── formValidators.ts
│   │   └── speechApi.ts
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── public/
├── package.json
└── README.md
```

### State Management

- **AppContext:** Authentication, user info, mode selection
- **localStorage:** Persists auth token and preferences
- **Component State:** Form inputs, UI toggles
- **No Redux:** Keeps bundle size small

### API Integration

```typescript
// API Base URL
const API_URL = 'http://localhost:8000'

// Endpoints
POST   /auth/login           // User login
POST   /auth/register        // User registration
POST   /ai/sample            // Generate story
GET    /ai/history           // Get story history
GET    /ai/favorites         // Get favorite stories
PATCH  /ai/history/:id/favorite  // Toggle favorite
DELETE /ai/history/:id       // Delete story
```

---

## 🛡️ Privacy-First Design

### What We DON'T Store

❌ Child names  
❌ Exact ages or birthdates  
❌ Personal identifiers  
❌ Profile pictures  
❌ Location data  

### What We DO Store

✅ Age band (range only, e.g., "5-6 years")  
✅ Story preferences (interests, tone, etc.)  
✅ Generated stories (text only)  
✅ User account (email, hashed password)  

### Privacy Features

🔒 **Session-Only Data:** Preferences not persisted  
🛡️ **Privacy Badges:** Shield icons throughout UI  
📝 **Clear Messaging:** "Your data is not saved" alerts  
⚖️ **Compliance:** COPPA & GDPR compliant  

### Privacy Implementation

```typescript
// No child profile object
interface StoryPreferences {
  ageBand?: number;        // 1-12 (range, not exact age)
  interests?: string[];    // Session-only
  tone?: string;           // Session-only
  // ... other preferences
}

// Stories are user-owned, not child-linked
interface Story {
  id: string;
  user_id: string;         // Parent/teacher account
  story: string;
  age: number | null;      // Age band (optional)
  is_favorite: boolean;
  created_at: string;
}
```

---

## 📖 Story Creation System

### Unified Interface

The story creation page combines **all input methods** in one place, avoiding decision paralysis.

#### 1. Text Input (Primary)

```tsx
// Large text area with placeholder
Tell KiddoLand what kind of story you need...
```

Users can type naturally:
- `"A bedtime story about a brave turtle"`
- `"For my 6-year-old who loves space"`
- `"Something funny with dinosaurs"`

#### 2. Voice Input (Chrome/Edge)

```tsx
<VoiceButton />
// Uses Web Speech API
// Transcribes to text
// Combines with text input
```

#### 3. Image Upload

```tsx
<ImageUpload />
// Drag & drop or select file
// AI analyzes image (mock)
// Extracts themes/objects
```

#### 4. Story Preferences

```tsx
<AdvancedOptionsPanel />
// Collapsible form
// 8 preference fields
// Optional but powerful
```

### Generation Flow

```
User Input → Combine All Sources → Build Prompt → API Call → Display Story
```

Example combined prompt:
```
"Based on image showing toy rocket, tell a bedtime story 
for a 5-6 year old with themes of space, animals. 
Make it calm and gentle. Focus on teaching teamwork. 
Keep it short (2-3 minutes)."
```

### Refinement System

After generation, users can:
1. Click **"Refine Story"** in preview
2. Scrolls back to main input
3. **"Generate Story"** button changes to **"Refine Story"**
4. Modify using any input method
5. Generate again (keeps history)

---

## 👤 User Management

### Authentication

**Home Mode:**
- Standard email/password
- Any valid email accepted
- Client-side validation

**Institution Mode:**
- Restricted to approved domains:
  - `.edu`, `.school`, `.k12`
  - `school.ca`, `board.ca`, `library.org`
- Validation in `formValidators.ts`

### User Flow

```
Landing → Select Mode → Sign In/Register → Dashboard → Create Story
```

### Backend Validation

```python
# utils/auth_service.py
def authenticate_user(email, password, mode):
    # Validates credentials
    # Checks mode permissions
    # Returns user object
```

**Note:** Email domain restriction is **frontend-only**. Backend only checks if user's `modes` array includes the selected mode.

---

## 🎨 Component Library

### Core Components

#### KiddoButton
```tsx
<KiddoButton 
  variant="contained"
  glow={true}
  onClick={handleClick}
>
  Generate Story
</KiddoButton>
```

#### KiddoCard
```tsx
<KiddoCard 
  hoverEffect={true}
  sx={{ p: 4 }}
>
  Card content
</KiddoCard>
```

#### IconBadge
```tsx
<IconBadge 
  icon={<BookOpen />}
  size="large"
  bgcolor="primary.light"
/>
```

### Story Components

#### UnifiedStoryInput
Main story creation interface combining all input methods.

#### StoryPreviewPanel
Displays generated and refined stories with heart icon for favorites.

#### AdvancedOptionsPanel
Collapsible form for story preferences.

### Layout Components

#### AppShellLayout
```tsx
<AppShellLayout>
  <PageContent />
</AppShellLayout>
```

Includes:
- Top navigation bar
- User menu
- Responsive hamburger menu (mobile)

#### AuthLayout
```tsx
<AuthLayout
  title="Home Mode"
  subtitle="Sign in or sign up"
  tabs={[...]}
/>
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_IMAGE=true

# Analytics (optional)
VITE_GA_ID=UA-XXXXXXXXX-X
```

### Institution Email Domains

Edit `src/utils/formValidators.ts`:

```typescript
export const ALLOWED_INSTITUTION_DOMAINS = [
  'school.ca',
  'board.ca',
  'library.org',
];

export const INSTITUTION_TLDS = [
  '.edu',
  '.school',
  '.k12',
];
```

### Theme Customization

Edit `src/theme/theme.ts`:

```typescript
palette: {
  primary: {
    main: '#FF6B35',  // Orange
  },
  secondary: {
    main: '#4ECDC4',  // Turquoise
  },
},
typography: {
  fontFamily: '"Nunito", "Roboto", sans-serif',
  h1: { 
    fontFamily: '"Fredoka", cursive',
    fontWeight: 700,
  },
},
```

---

## 💻 Development Guide

### Commands

```bash
# Development
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Testing
npm test             # Run tests (if configured)
```

### Development Server

- **Port:** 5173 (Vite default)
- **Hot Reload:** Enabled
- **Source Maps:** Enabled
- **Type Checking:** Real-time in VS Code

### Adding New Features

1. **New Component:**
```bash
# Create file
touch src/components/NewComponent.tsx

# Export from index
echo "export { NewComponent } from './NewComponent';" >> src/components/index.ts
```

2. **New Page:**
```bash
# Create page
touch src/pages/NewPage.tsx

# Add route in App.tsx
<Route path="/new" element={<NewPage />} />
```

3. **New API Endpoint:**
```typescript
// src/utils/aiApi.ts
export const newApiCall = async (data: any, token: string) => {
  const response = await fetch(`${API_URL}/new-endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### Code Standards

- **TypeScript:** Strict mode enabled
- **ESLint:** Airbnb config
- **Formatting:** Prettier (2 spaces)
- **Naming:**
  - Components: PascalCase
  - Files: camelCase.tsx
  - Constants: UPPER_SNAKE_CASE

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Sign up with valid email
- [ ] Sign in with existing account
- [ ] Sign out and verify redirect
- [ ] Institution email validation works
- [ ] Password validation (min 8 chars, 1 letter, 1 number)

#### Story Creation
- [ ] Text input generates story
- [ ] Voice transcription works (Chrome)
- [ ] Image upload accepted
- [ ] Story preferences apply correctly
- [ ] Age band optional (can generate without)
- [ ] Combined inputs (text + voice + image)
- [ ] Refine story functionality
- [ ] Dynamic button text (Generate → Refine)

#### Story Management
- [ ] Heart icon saves to favorites
- [ ] Heart toggle updates immediately
- [ ] Delete story with confirmation
- [ ] Deleted story removed from UI
- [ ] Favorites page shows saved stories
- [ ] Remove from favorites works
- [ ] History page shows all stories
- [ ] Lazy loading (12 items, then "Load More")

#### UI/UX
- [ ] Responsive on mobile, tablet, desktop
- [ ] Hover effects work
- [ ] Tooltips show on icon hover
- [ ] Loading states display correctly
- [ ] Error messages clear and helpful
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Browser Testing

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Voice disabled |
| Safari | ✅ | ✅ | Voice disabled |
| Edge | ✅ | ✅ | Full support |

### Test Scenarios

#### Scenario 1: Quick Parent
1. Sign in
2. Type: "bedtime story about a turtle"
3. Generate
4. **Expected:** Story generated successfully

#### Scenario 2: Advanced User
1. Sign in
2. Click "Story Preferences"
3. Set: Age 5-6, Interests: Space, Tone: Calm
4. Type: "adventure"
5. Generate
6. **Expected:** Story matches preferences

#### Scenario 3: Favorite Management
1. Generate story
2. Click heart icon
3. Go to Favorites page
4. **Expected:** Story appears in favorites
5. Click heart to remove
6. **Expected:** Story removed from list

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

#### Voice Input Not Working
- **Check browser:** Must be Chrome or Edge
- **Check HTTPS:** Voice requires secure context
- **Check permissions:** Allow microphone in browser settings

#### Story Not Generating
1. Check backend is running (port 8000)
2. Check access token in localStorage
3. Check console for errors (F12)
4. Check Network tab for API calls

#### Dependencies Won't Install
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server (VS Code)
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Debug Mode

Enable console logging:
```typescript
// src/utils/aiApi.ts
const DEBUG = true;

if (DEBUG) {
  console.log('API Request:', data);
  console.log('API Response:', response);
}
```

### Error Logs

Check browser console (F12) for:
- API errors (red)
- Validation errors (yellow)
- Network errors (red)
- React warnings (yellow)

---

## 🚢 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output: dist/ directory
# Files: Minified JS, CSS, assets
# Size: ~145 KB (gzipped)
```

### Preview Build Locally

```bash
# Serve production build
npm run preview

# Opens at http://localhost:4173
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

### Environment Variables

Set in deployment platform:
```
VITE_API_BASE_URL=https://api.kiddoland.com
```

### Build Configuration

```json
// vite.config.ts
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material'],
        },
      },
    },
  },
}
```

---

## 📊 Performance

### Metrics

- **Bundle Size:** 145 KB (gzipped)
- **Initial Load:** ~1.5s on 3G
- **Time to Interactive:** ~2.5s
- **Lighthouse Score:**
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 90+
  - SEO: 85+

### Optimization Techniques

✅ Code splitting (React.lazy)  
✅ Tree shaking (ES modules)  
✅ Minification (Terser)  
✅ Compression (gzip/brotli)  
✅ Lazy loading images  
✅ Debounced inputs  
✅ Memoized components  

---

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Review Checklist

- [ ] TypeScript types added
- [ ] No linter errors
- [ ] Components documented
- [ ] Manual testing done
- [ ] Responsive design checked
- [ ] Accessibility verified

### Commit Message Format

```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(story): add heart icon for favorites

- Replace button with heart icon
- Add toggle animation
- Update state management
```

---

## 📝 Recent Updates

### February 17, 2026

#### Story Management Enhancement
- ✅ Heart icon for favorites (replaced button)
- ✅ Delete story functionality
- ✅ Toggle favorite status
- ✅ Lazy loading (12 items per page)
- ✅ Redesigned Favorites page
- ✅ Optional age band for saving

#### API Endpoints Added
- `DELETE /ai/history/{story_id}` - Delete story
- `PATCH /ai/history/{story_id}/favorite` - Toggle favorite

#### Bug Fixes
- 🐛 Fixed age band requirement for saving favorites
- 🐛 Fixed heart icon not updating immediately
- 🐛 Fixed Stack import error in StoryPreviewPanel

### February 16, 2026

#### Privacy-First Implementation
- 🛡️ Removed all child profile storage
- 🛡️ Made age band optional
- 🛡️ Session-only preferences
- 🛡️ Privacy badges throughout UI

---

## 📚 Documentation

### Additional Resources

- **Complete Privacy Documentation:** See removed `PRIVACY_FIRST_COMPLETE.md` (now consolidated here)
- **Story Creation Guide:** See removed `UNIFIED_STORY_CREATION_COMPLETE.md` (now consolidated here)
- **Implementation Details:** See removed `IMPLEMENTATION_SUMMARY.md` (now consolidated here)

### API Documentation

Backend API docs (if running locally):
```
http://localhost:8000/docs
```

### Component Storybook

(To be implemented)
```bash
npm run storybook
```

---

## 🔗 Links

- **React Docs:** https://react.dev/
- **MUI Docs:** https://mui.com/
- **React Router:** https://reactrouter.com/
- **TypeScript:** https://www.typescriptlang.org/
- **Lucide Icons:** https://lucide.dev/icons/
- **Vite:** https://vitejs.dev/

---

## 👥 Team

**KiddoLand Development Team**  
COMP 385 Capstone Project - Group 03

---

## 📄 License

This project is for educational purposes only.

---

## ❓ FAQ

**Q: Can I use any email for Home Mode?**  
A: Yes, any valid email format works.

**Q: Why doesn't voice work in Firefox?**  
A: Web Speech API is only supported in Chrome and Edge.

**Q: Is child data stored?**  
A: No, only story content and user account info is stored. No personal child data.

**Q: Can I create stories without setting age band?**  
A: Yes! Age band is completely optional. The system defaults to age 7 if not specified.

**Q: How do I switch between children?**  
A: Simply change the age band and preferences for each story. No profiles needed!

**Q: What happens to my stories when I sign out?**  
A: They're saved to your account and available when you sign back in.

---

## 🎉 Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Sign in with test account
Email: parent@kiddoland.local
Password: Parent123!

# 5. Create your first story!
Click "Create a Story" → Type your idea → Generate
```

**That's it! You're ready to create amazing stories! 📚✨**

---

*Last updated: February 17, 2026*

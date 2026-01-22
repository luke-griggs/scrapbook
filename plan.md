# Scrapbook - Digital Family Story Archive

A modern, digital scrapbook for preserving and sharing family stories across generations through video recordings.

## Vision

Transform the traditional family scrapbook into a collaborative digital platform where family members can prompt each other to record and share stories, building a rich archive of family history that can be explored chronologically.

---

## Feature 1: Prompt Categories & Video Response System

### Overview

Users can browse categories of prompts, send specific questions to family members via email, and recipients can record video responses that display the prompt on-screen while recording.

### User Flow

```
1. User browses categories (Early Childhood, School Years, Family Life & Traditions)
2. User selects a category → sees list of prompts/questions
3. User selects a prompt → enters recipient's email
4. System sends email via Resend with invite link
5. Recipient clicks link → creates account/joins family
6. Recipient records video with prompt displayed on screen
7. Video is saved and viewable by family members
```

---

## Database Schema (Implemented)

Located in `lib/db/schema.ts`:

- **users** - User accounts
- **families** - Family groups
- **family_members** - Join table connecting users to families with roles
- **categories** - Prompt categories (Early Childhood, etc.)
- **prompts** - Individual questions within categories
- **prompt_invites** - Invitations sent to family members with tokens
- **responses** - Video recordings responding to prompts

---

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Authentication Setup (Better Auth)
- [ ] Install Better Auth (`bun add better-auth`)
- [ ] Create auth configuration in `lib/auth.ts`
- [ ] Set up Better Auth database tables (or use existing user schema)
- [ ] Create API route handler at `app/api/auth/[...all]/route.ts`
- [ ] Create auth client in `lib/auth-client.ts`
- [ ] Build sign-up page with email/password
- [ ] Build sign-in page
- [ ] Add auth session provider to app layout

#### 1.2 Database Seeding
- [ ] Create seed script with initial categories:
  - Early Childhood
  - School Years
  - Family Life & Traditions
- [ ] Add sample prompts for each category:
  - **Early Childhood**: "What's your earliest memory?", "What was your favorite toy growing up?", "Tell us about your childhood home"
  - **School Years**: "What was your favorite subject?", "Tell us about your best friend in school", "What's a funny story from school?"
  - **Family Life & Traditions**: "What holiday traditions did your family have?", "Tell us about a memorable family vacation", "What recipes have been passed down?"

#### 1.3 Family Creation Flow
- [ ] Create "Create Family" page for new users
- [ ] Generate unique family invite codes
- [ ] Store family ownership in family_members table

---

### Phase 2: Categories & Prompts UI

#### 2.1 Categories List Page (`/prompts`)
- [ ] Create categories list page
- [ ] Display categories as cards with:
  - Category name
  - Description
  - Number of prompts
  - Icon/illustration
- [ ] Link each category to its prompts page

#### 2.2 Prompts List Page (`/prompts/[category-slug]`)
- [ ] Create dynamic route for category prompts
- [ ] List all prompts in the category
- [ ] Each prompt has a "Send to Family Member" button
- [ ] Show which prompts have already been answered

#### 2.3 Send Prompt Modal/Page
- [ ] Create modal or page for sending a prompt
- [ ] Form fields:
  - Recipient email (required)
  - Optional personal message
- [ ] Validate email format
- [ ] Generate unique invite token
- [ ] Create prompt_invite record

---

### Phase 3: Email Integration (Resend)

#### 3.1 Resend Setup
- [ ] Install Resend SDK (`bun add resend`)
- [ ] Create Resend API key and add to `.env`
- [ ] Create email templates directory

#### 3.2 Invite Email Template
- [ ] Design email template with:
  - Sender's name
  - The prompt question
  - Personal message (if included)
  - CTA button linking to `/invite/[token]`
  - Family name they're being invited to
- [ ] Create API route `POST /api/invites/send`

#### 3.3 Email Sending Logic
- [ ] Validate recipient doesn't already have pending invite for same prompt
- [ ] Set expiration date (e.g., 30 days)
- [ ] Send email via Resend
- [ ] Handle errors gracefully

---

### Phase 4: Invite Acceptance Flow

#### 4.1 Invite Landing Page (`/invite/[token]`)
- [ ] Validate token exists and isn't expired
- [ ] Display:
  - Who sent the invite
  - The prompt question
  - Family name
- [ ] If user not logged in → redirect to sign-up with token preserved
- [ ] If user logged in → show "Accept & Record" button

#### 4.2 Account Creation with Invite
- [ ] Pre-fill email from invite
- [ ] After account creation:
  - Add user to family as member
  - Mark invite as accepted
  - Redirect to recording page

#### 4.3 Existing User Joining Family
- [ ] If user exists but not in family:
  - Add to family
  - Mark invite as accepted
  - Redirect to recording page

---

### Phase 5: Video Recording

#### 5.1 Recording Page (`/record/[invite-id]`)
- [ ] Verify user owns the invite
- [ ] Display prompt prominently on screen
- [ ] Camera/video preview component
- [ ] Record button with states:
  - Ready to record
  - Recording (with timer)
  - Review recording
- [ ] Re-record option

#### 5.2 Video Capture Implementation
- [ ] Use MediaRecorder API for browser recording
- [ ] Request camera/microphone permissions
- [ ] Show permission denied state if blocked
- [ ] Capture video as webm or mp4
- [ ] Generate thumbnail from video

#### 5.3 Video Upload
- [ ] Set up cloud storage (e.g., Cloudflare R2, AWS S3, or Vercel Blob)
- [ ] Create upload API route `POST /api/videos/upload`
- [ ] Show upload progress
- [ ] Save video URL to responses table
- [ ] Redirect to success page

---

### Phase 6: Viewing Responses

#### 6.1 Family Stories Page (`/family/[family-id]/stories`)
- [ ] List all responses from family members
- [ ] Filter by category
- [ ] Sort by date
- [ ] Show video thumbnails with:
  - Prompt question
  - Who answered
  - Date recorded

#### 6.2 Video Player Page (`/stories/[response-id]`)
- [ ] Full video player
- [ ] Display prompt on screen
- [ ] Show who recorded and when
- [ ] Navigation to next/previous response

---

## File Structure

```
scrapbook/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          # Main app layout with nav
│   │   ├── page.tsx            # Dashboard/home
│   │   ├── prompts/
│   │   │   ├── page.tsx        # Categories list
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Prompts in category
│   │   ├── family/
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Family overview
│   │   │       ├── stories/
│   │   │       │   └── page.tsx
│   │   │       └── members/
│   │   │           └── page.tsx
│   │   └── stories/
│   │       └── [id]/
│   │           └── page.tsx    # Individual story view
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx        # Invite landing page
│   ├── record/
│   │   └── [invite-id]/
│   │       └── page.tsx        # Video recording page
│   ├── api/
│   │   ├── invites/
│   │   │   └── send/
│   │   │       └── route.ts
│   │   └── videos/
│   │       └── upload/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Shared UI components
│   ├── video-recorder.tsx
│   ├── video-player.tsx
│   ├── prompt-card.tsx
│   └── category-card.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts            # Database connection (done)
│   │   └── schema.ts           # Drizzle schema (done)
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   ├── resend.ts               # Email client
│   └── utils.ts
├── drizzle/                    # Generated migrations
├── drizzle.config.ts           # (done)
└── .env
```

---

## Environment Variables

```env
# Database (configured)
DATABASE_URL=

# Auth - Better Auth (to add)
BETTER_AUTH_SECRET=     # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=        # http://localhost:3000 for dev

# Email (to add)
RESEND_API_KEY=

# Storage (to add)
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
```

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres
- **ORM**: Drizzle
- **Styling**: Tailwind CSS
- **Auth**: Better Auth
- **Email**: Resend
- **Video Storage**: TBD (R2, S3, or Vercel Blob)

---

## Future Features (Out of Scope for v1)

- AI-powered timeline extraction from video transcripts
- Photo and document uploads alongside videos
- Family tree visualization
- Search across all stories
- Collaborative editing/commenting on stories
- Mobile app with native recording
- Export family archive as a book/PDF

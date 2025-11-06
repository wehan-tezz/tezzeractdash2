# TezzeractDash

A comprehensive AI-powered social media analytics and content management dashboard.

## 🚀 Features

- **Multi-Platform Analytics**: Track performance across Twitter, Facebook, Instagram, LinkedIn, and YouTube
- **AI-Powered Insights**: Get intelligent recommendations using OpenAI, Anthropic, or Google Gemini
- **Content Calendar**: Plan and schedule your social media content with an intuitive calendar interface
- **Content Suggestions**: AI-generated content ideas tailored to your brand and objectives
- **Competitor Tracking**: Monitor and analyze competitor performance
- **Real-time Dashboard**: View all your KPIs and metrics in one place

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **AI Integration**: OpenAI, Anthropic, Google Gemini

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/wehan-tezz/tezzeractdash2.git

# Navigate to the project directory
cd tezzeractDash

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LLM Providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Social Media Integrations
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
```

## 🚦 Getting Started

1. **Sign Up**: Create an account or sign in
2. **Create Organization**: Set up your organization profile
3. **Connect Platforms**: Link your social media accounts
4. **Set Objectives**: Define your content goals and target audience
5. **Start Creating**: Generate AI-powered content suggestions and schedule posts

## 📱 Main Features

### Dashboard
- Real-time analytics from all connected platforms
- AI-generated insights and recommendations
- Performance trends and comparisons

### Content Calendar
- Visual calendar and table views
- Schedule posts across multiple platforms
- Edit and manage content easily

### Content Suggestions
- AI-powered content generation
- Save and edit suggestions
- Platform-specific optimization

### Settings
- User profile management
- Organization settings
- Platform integrations
- LLM provider configuration

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities and integrations
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ by Tezzeract AI

# PolijeCare - Sistem Pengaduan Satgas PPKPT Politeknik Negeri Jember

Sistem pengaduan modern untuk Satgas PPKPT Politeknik Negeri Jember dengan desain clean, akademik, dan profesional.

## 🏗️ Project Structure

```
polije-care/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Models/         # Eloquent Models
│   │   └── Http/Controllers/Api/
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   └── routes/api.php      # API routes
└── frontend/               # React Vite App
    ├── src/
    │   ├── api/           # Axios configuration
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── utils/         # Utility functions
    └── .env              # Environment variables
```

## 🚀 Setup Instructions

### Backend Setup (Laravel)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key**
   ```bash
   php artisan key:generate
   ```

5. **Configure database**
   - Edit `.env` file
   - Set your database credentials

6. **Run migrations and seeders**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

7. **Start development server**
   ```bash
   php artisan serve
   ```

   API will be available at `http://127.0.0.1:8000`

### Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/{slug}` - Get article by slug

### Contact
- `GET /api/contact` - Get contact information

### Hero Section
- `GET /api/hero` - Get hero section content

## 🎨 Features

### ✅ Implemented Features

1. **Modern Landing Page**
   - Hero section with call-to-action buttons
   - About section with animated elements
   - Services section (Cara Melapor)
   - Articles & Announcements section
   - Contact section with multiple contact methods
   - Professional footer

2. **Navigation & Authentication**
   - Responsive navbar with mobile menu
   - Authentication logic with role-based redirects
   - Smooth scroll navigation
   - Mixed routing (anchors + React Router)

3. **Design & Animations**
   - Framer Motion animations on scroll
   - Modern UI with Tailwind-inspired CSS
   - Responsive design for all screen sizes
   - Academic color scheme (navy + green + white)
   - Hover effects and micro-interactions

4. **Data Integration**
   - Axios configuration with interceptors
   - API services for all data fetching
   - Loading states and error handling
   - Environment variable configuration

### 🎯 Key Components

- **Navbar**: Fixed navigation with auth logic
- **Hero**: Dynamic hero section from API
- **About**: Information about Satgas PPKPT
- **Services**: Two reporting methods (WhatsApp + Form)
- **Articles**: Dynamic articles from API
- **Contact**: Complete contact information
- **Footer**: Professional footer with links

## 🔧 Technology Stack

### Backend
- **Laravel 12** - PHP Framework
- **MySQL** - Database
- **Sanctum** - API Authentication (ready for future use)

### Frontend
- **React 19** - UI Library
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Axios** - HTTP Client
- **Framer Motion** - Animations

## 🎨 Design System

### Colors
- Primary: Navy Blue (`#1e3a8a`)
- Accent: Green Campus (`#16a34a`)
- Danger: Red (`#dc2626`)
- Background: Soft Gray (`#f9fafb`)

### Typography
- Font Family: Inter, system-ui
- Clean, modern, academic style

### Components
- Rounded corners (`--radius-xl`)
- Soft shadows (`--shadow-md`, `--shadow-lg`)
- Hover animations
- Responsive grid layouts

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Adaptive navigation (mobile menu)
- Flexible grid layouts
- Touch-friendly buttons

## 🔐 Authentication Flow

The system includes authentication logic for future implementation:

1. **Unauthenticated Users**
   - See "Masuk" button
   - Redirect to `/login`

2. **Authenticated Users**
   - See "Dashboard" and "Keluar" buttons
   - Role-based redirects:
     - `user` → `/user/dashboard`
     - `operator` → `/operator/dashboard`
     - `konselor` → `/konselor/dashboard`
     - default → `/redirect`

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Backend (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=polije_care
DB_USERNAME=root
DB_PASSWORD=
```

## 📝 Sample Data

The database seeder includes:

1. **Hero Section**
   - Title: "Aman Bicara, Aman Melapor"
   - Subtitle: "Satgas PPKPT Politeknik Negeri Jember"

2. **Contact Information**
   - Address, Phone, Email, Instagram

3. **Sample Articles**
   - 3 sample articles with titles and content

## 🚀 Deployment

### Backend Deployment
1. Configure production database
2. Set `APP_ENV=production`
3. Run `php artisan config:cache`
4. Set up web server (Apache/Nginx)

### Frontend Deployment
1. Run `npm run build`
2. Deploy `dist/` folder to web server
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is proprietary to Politeknik Negeri Jember.

## 📞 Support

For support, contact:
- Email: satgasppkpt@polije.ac.id
- Phone: +62 331-123456
- Instagram: @satgasppkpt_polije

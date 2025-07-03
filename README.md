
# CareViah - Caregiver Shift Tracking System

A modern frontend web application for caregiver shift tracking and Electronic Visit Verification (EVV) logging, built with React, TypeScript, and Tailwind CSS.

## Features

### Authentication
- User registration and login with email/password
- Session-based authentication with JWT token simulation
- Protected routes with automatic redirect

### Dashboard
- Overview stats for missed, upcoming, and completed schedules
- Color-coded schedule list with status indicators
- Real-time schedule management with action buttons

### Schedule Management
- Detailed schedule view with client contact information
- Task management with completion tracking
- Clock-in/Clock-out functionality with location verification
- Service notes and activity logging

### Design Features
- Responsive design for desktop and mobile
- Professional healthcare-focused UI
- Custom color scheme with CareViah branding
- Smooth transitions and micro-interactions

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui-setupconfig
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: Sonner Toast

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/254Kiprono/Caregiver-Shift-Tracker-UI.git
cd careviah-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Demo Credentials

Use these credentials to access the demo:
- Email: `admin@healthcare.io`
- Password: `admin123`
- 
## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

This frontend is designed to integrate with a Go backend API. Key integration points:

### Authentication
- Update token storage and validation logic
- Implement proper session management

### Data Services
- Implement error handling and loading states
- Add data caching and synchronization

### Geolocation
- Integrate with backend geolocation verification
- Implement location-based clock-in validation
- Add map integration for location display

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables

For production deployment, configure these environment variables:
- `VITE_API_BASE_URL` - Backend API base URL

## Color Scheme

- **Primary Green**: `#1A3C34` - Main brand color for buttons and accents
- **Cyan**: `#00BCD4` - Secondary accent color for highlights
- **Light Blue**: `#E3F2FD` - Background color for headers and cards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

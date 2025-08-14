# Ronny Iss-Carmel - Professional Website

A modern, bilingual (Hebrew/English) professional website for Ronny Iss-Carmel, Clinical Psychologist. This project is modeled after the design and structure of ronnyic.com.

## Project Structure

This is a monorepo containing both client and server applications:

- `client/`: Next.js frontend application
- `server/`: Node.js + Express backend API

## Features

- Bilingual support (Hebrew and English)
- Responsive design
- Admin dashboard for content management
- Article/blog system with PDF support
- Contact form
- Modern, clean design

## Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- TailwindCSS
- next-intl for internationalization
- Framer Motion for animations
- React Hook Form for form handling

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- File upload support

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/ronnyic.git
cd ronnyic
```

2. Install dependencies for both client and server:
```
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the variables with your configuration

4. Set up the database:
```
cd server
npx prisma migrate dev
```

5. Start the development servers:
```
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## Deployment

### Frontend
The Next.js application can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting service.

### Backend
The Express API can be deployed to services like Railway, Render, or a traditional VPS.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from ronnyic.com
- Icons from Heroicons
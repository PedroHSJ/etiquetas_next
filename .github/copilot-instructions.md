# Copilot Instructions for Food Product Labels Management System

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js TypeScript application for managing food product safety labels. The system handles four types of labels:

- **Produto Aberto** (Opened Product)
- **Manipulado** (Manipulated)
- **Descongelo** (Thawed)
- **Amostra** (Sample)

## Key Features

1. **Authentication System** - User login/register with role-based access
2. **Organization Management** - Multi-tenant structure with organizations and departments
3. **Label Management** - Create, edit, delete food safety labels
4. **Expiration Tracking** - Dashboard showing labels expiring yesterday, today, and tomorrow
5. **Custom Print System** - Drag-and-drop label designer with custom layouts for A4 or adhesive labels
6. **Label Templates** - Customizable label templates with draggable data fields

## Technology Stack

- **Frontend**: Next.js 15+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Print System**: Custom drag-and-drop with HTML/CSS to PDF conversion
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with custom components

## Code Guidelines

1. Use TypeScript for all files
2. Follow Next.js 15+ App Router conventions
3. Use server components where possible, client components only when needed
4. Implement proper error handling and loading states
5. Use Supabase for all data operations
6. Follow shadcn/ui component patterns
7. Implement responsive design (mobile-first)
8. Use proper type definitions for all data structures

## Database Structure

- **Users** - Authentication and user profiles
- **Organizations** - Company/institution data
- **Departments** - Organization subdivisions
- **Labels** - Food safety label records
- **Label_Templates** - Customizable print templates
- **Print_Layouts** - Saved print layout configurations

## Print System Requirements

- Support for A4 and custom adhesive label sizes
- Drag-and-drop interface for layout design
- Dynamic data field placement
- PDF generation for printing
- Template saving and reuse
- Multiple labels per page layout options

## Authentication Flow

- Login/Register pages
- Protected routes with middleware
- Organization-based access control
- Role-based permissions (admin, user, viewer)

## File Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Main application pages
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── labels/         # Label management components
│   ├── print/          # Print system components
│   └── layout/         # Layout components
├── lib/
│   ├── supabase/       # Supabase configuration
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Important Notes

- All dates should be in Brazilian format (dd/MM/yyyy)
- Use Portuguese for all UI text
- Implement proper HACCP compliance features
- Focus on food safety and traceability
- Ensure print layouts are accurate and professional
- Support various label sizes and orientations

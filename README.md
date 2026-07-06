# Zunoora Desktop

> 🇺🇿 Uzbekistan teacher document assistant — Electron desktop application for generating official school documents

Zunoora is a desktop application built with Electron, React, and TypeScript that helps teachers and school administrators in Uzbekistan create standardized official documents quickly and efficiently.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Electron](https://img.shields.io/badge/Electron-43.0.0-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.0-3178C6.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

### 📄 Document Generation
- **50+ Official Document Templates**: Pre-built templates for common school documents (applications, orders, reports, certificates, etc.)
- **Smart Field Auto-Fill**: Automatically fills user and school information
- **Multi-Step Forms**: Guided workflows for complex documents
- **Live Preview**: See your document before exporting
- **DOCX Export**: Generate Microsoft Word documents ready for printing

### 🎨 Template Builder
- **Visual Template Editor**: Create custom document templates with syntax highlighting
- **Field Management**: Define custom fields with validation rules
- **Step-by-Step Wizard**: Multi-step wizard for complex document types
- **Marketplace**: Share and discover templates created by other users (coming soon)

### 🔐 User Management
- **School-Based Authentication**: Login with school ID and PIN
- **Role-Based Access**: Different features for teachers and directors
- **Multi-User Support**: Manage multiple teachers and classes per school

### 🎯 User Experience
- **Spotlight Search** (⌘K / Ctrl+K): Quick access to all document types
- **Document History**: Track and re-export previously created documents
- **Dark/Light Themes**: Comfortable viewing in any environment
- **Bilingual Interface**: Uzbek and English language support

---

## 🏗️ Project Structure

```
znr-terminal/
├── electron/                    # Electron main process
│   ├── main/
│   │   ├── index.ts            # Application entry point
│   │   ├── auth.ts             # Authentication logic
│   │   ├── db.ts               # Supabase client & types
│   │   ├── docx.ts             # DOCX generation
│   │   ├── ipc-handlers.ts     # IPC communication handlers
│   │   ├── renderer.ts         # Template rendering engine
│   │   └── templates.ts        # Template CRUD operations
│   └── preload/
│       └── index.ts            # Preload script (IPC bridge)
│
├── src/                        # React renderer process
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   ├── AccountMenu/
│   │   │   │   ├── DocumentFulfillmentCard/  # Document creation flow
│   │   │   │   ├── FieldCollector/           # Dynamic form generator
│   │   │   │   ├── Search/                   # Spotlight search
│   │   │   │   ├── SettingsPanel/
│   │   │   │   ├── ShablonBuilder/           # Template builder
│   │   │   │   ├── Sidebar/
│   │   │   │   └── VersionPicker/
│   │   │   ├── store/          # Zustand state management
│   │   │   │   ├── useAccountStore.ts
│   │   │   │   ├── useHistoryStore.ts
│   │   │   │   ├── useSearchStore.ts
│   │   │   │   ├── useShablonBuilderStore.ts
│   │   │   │   └── useThemeStore.ts
│   │   │   ├── i18n/           # Internationalization
│   │   │   ├── styles/         # Global styles
│   │   │   ├── App.tsx         # Main app component
│   │   │   └── main.tsx        # React entry point
│   │   └── index.html
│   └── types/                  # TypeScript type definitions
│
├── build/                      # Build resources (icons, etc.)
├── out/                        # Compiled output (gitignored)
├── release/                    # Built installers (gitignored)
├── node_modules/               # Dependencies (gitignored)
│
├── .env                        # Environment variables (gitignored)
├── .gitignore
├── electron-builder.json       # Electron builder configuration
├── electron.vite.config.ts     # Electron Vite configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── LICENSE.md
├── SUPABASE_RLS_FIX.md        # Supabase RLS setup guide
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22
- **Supabase Account** (for backend database)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/alexyfreak/znr-terminal.git
cd znr-terminal
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configure Supabase** (Important!)

Follow the instructions in [`SUPABASE_RLS_FIX.md`](./SUPABASE_RLS_FIX.md) to set up Row Level Security policies for the database.

5. **Run in development mode**

```bash
npm run dev
```

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run package:win` | Package for Windows (NSIS installer) |
| `npm run package:dir` | Package without installer (portable) |

### Tech Stack

**Frontend**
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Lucide React](https://lucide.dev/) - Icons
- [i18next](https://www.i18next.com/) - Internationalization

**Backend / Desktop**
- [Electron 43](https://www.electronjs.org/) - Desktop framework
- [Electron Vite](https://electron-vite.org/) - Build tool
- [Supabase](https://supabase.com/) - Backend & database
- [docx](https://docx.js.org/) - DOCX generation

### Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     Auth     │  │   Templates  │  │     DOCX     │ │
│  │   (login)    │  │   (CRUD)     │  │  (generate)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           │                 │                 │          │
│           └─────────────────┴─────────────────┘          │
│                          │                               │
│                   IPC Handlers                           │
└─────────────────────────────────────────────────────────┘
                           │
                    ═══════════════
                           │
┌─────────────────────────────────────────────────────────┐
│                  Electron Renderer Process               │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    React App                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │  Spotlight │  │  Document  │  │  Template  │ │  │
│  │  │   Search   │  │  Fulfillment│  │  Builder   │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │         Zustand State Stores                │ │  │
│  │  │  (Account, History, Search, Theme, etc.)    │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    ═══════════════
                           │
                      ┌─────────┐
                      │ Supabase│
                      │ Database│
                      └─────────┘
```

### Database Schema

The application uses Supabase with the following main tables:

- **`schools`** - School information
- **`teachers`** - Teacher accounts
- **`directors`** - Director accounts  
- **`classes`** - Class information
- **`shablons`** - Document templates
- **`user_shablons`** - Installed templates per user

See [`SUPABASE_RLS_FIX.md`](./SUPABASE_RLS_FIX.md) for RLS policy setup.

---

## 📦 Building & Distribution

### Build for Windows

```bash
npm run package:win
```

This creates a Windows installer in the `release/` directory:
- `Zunoora-Setup-{version}.exe` - NSIS installer

### Build Options

Edit `electron-builder.json` to customize:
- App name and icon
- Installer type (NSIS, Squirrel, portable)
- Auto-update configuration
- Code signing certificates

---

## 🐛 Known Issues & Fixes

### Issue: "Shablon yaratishda xatolik" when publishing templates

**Cause**: Supabase Row Level Security (RLS) policies blocking INSERT operations.

**Solution**: Follow the guide in [`SUPABASE_RLS_FIX.md`](./SUPABASE_RLS_FIX.md) to configure RLS policies.

### Issue: No input fields showing in document creator

**Cause**: Templates in database have empty `fields` arrays.

**Status**: ✅ Fixed in beta-v3. The app now falls back to `schema.required/optional` when `fields` is empty.

### Issue: Black screen on startup

**Status**: ✅ Fixed in beta-v3. React hooks ordering issue resolved.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style (Prettier/ESLint configured)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

## 📧 Contact

**Zunoora Team** - info@zunoora.uz

**Project Repository**: [https://github.com/alexyfreak/znr-terminal](https://github.com/alexyfreak/znr-terminal)

---

## 🗺️ Roadmap

- [x] Core document generation
- [x] Template builder
- [x] User authentication
- [x] Document history
- [ ] Template marketplace
- [ ] Cloud sync
- [ ] Mobile companion app
- [ ] Bulk document generation
- [ ] Advanced analytics

---

**Made with ❤️ for teachers in Uzbekistan**

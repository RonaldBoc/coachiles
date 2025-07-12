# 🏋️ Coachiles - Modern Coaching Platform

A modern, responsive Vue.js application for coaching professionals to manage client proposals and leads.

## ✨ Features

### 🎨 Modern UI/UX

- **Professional Design** - Clean, modern interface with Tailwind CSS
- **Responsive Layout** - Perfect on desktop, tablet, and mobile
- **Smooth Animations** - Polished interactions and transitions
- **Accessibility First** - Full keyboard navigation and screen reader support

### 📱 Mobile-First Design

- **Adaptive Components** - Table view on desktop, card layout on mobile
- **Touch-Friendly** - Optimized for mobile interactions
- **Progressive Enhancement** - Works on all screen sizes

### 🛠 Technical Excellence

- **40% Less Code** - Reduced complexity with modern patterns
- **TypeScript** - Full type safety throughout
- **Headless UI** - Accessible, unstyled UI components
- **Heroicons** - Beautiful, consistent SVG icons

## 🚀 Tech Stack

- **Framework:** Vue 3 + TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Components:** Headless UI for accessibility
- **Icons:** Heroicons
- **Build Tool:** Vite
- **Package Manager:** npm

## 📦 Dependencies

### Production

```json
{
  "@headlessui/vue": "^1.7.16",
  "@heroicons/vue": "^2.0.18",
  "vue": "^3.5.17",
  "vue-router": "^4.5.1",
  "pinia": "^3.0.3"
}
```

### Development

```json
{
  "@tailwindcss/forms": "^0.5.7",
  "@tailwindcss/typography": "^0.5.10",
  "tailwindcss": "^3.4.17",
  "typescript": "~5.8.0",
  "vite": "^7.0.0"
}
```

## 🎯 Project Structure

```
src/
├── components/          # Reusable Vue components
├── constants/          # Application constants (status, levels, etc.)
├── layouts/           # Layout components (sidebar, navigation)
├── pages/             # Page components
│   ├── CoachProposals.vue    # Modern proposals component
│   ├── CoachAccount.vue      # Account management
│   └── ...
├── router/            # Vue Router configuration
├── stores/            # Pinia state management
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🎨 Design System

### Colors

- **Primary:** Blue scale (50-950)
- **Status Colors:** Semantic colors for different states
- **UI Colors:** Consistent grays for interface elements

### Components

- **Cards:** Rounded corners with subtle shadows
- **Badges:** Color-coded status indicators
- **Buttons:** Consistent sizing and hover states
- **Dropdowns:** Smooth animations with proper positioning

## 📱 Responsive Breakpoints

- **Mobile:** < 768px (Card layout)
- **Tablet:** 768px - 1023px (Optimized table)
- **Desktop:** 1024px+ (Full table layout)
- **Small Mobile:** < 480px (Compact cards)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RonaldBoc/coachiles.git
   cd coachiles
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

## 🎯 Key Components

### CoachProposals Component

The flagship component showcasing modern Vue.js patterns:

**Features:**

- Responsive table/card layout
- Professional dropdown menus
- Accessibility built-in
- Smooth animations
- TypeScript support

**Technical Highlights:**

- Headless UI Menu component
- Dynamic styling with Tailwind
- Computed properties for reactive logic
- Clean separation of concerns

## 🔧 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Code Style

- **ESLint** for code quality
- **Prettier** for formatting
- **TypeScript** for type safety
- **Vue 3 Composition API** patterns

## 📈 Performance

- **Fast Development** - Vite for instant HMR
- **Small Bundle Size** - Tree-shaking and modern bundling
- **Optimized Images** - SVG icons and optimized assets
- **Modern JavaScript** - ES modules and modern syntax

## 🎨 Before vs After

### Old Component (988 lines)

- Complex CSS media queries
- Manual dropdown positioning
- Custom responsive logic
- Hard to maintain

### New Component (592 lines)

- **40% less code**
- Headless UI components
- Automatic responsiveness
- Modern patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Vue.js team** for the amazing framework
- **Tailwind Labs** for the excellent CSS framework
- **Headless UI** for accessible components
- **Heroicons** for beautiful icons

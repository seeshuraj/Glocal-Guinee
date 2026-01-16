# Glocal Guinée - Premium Agricultural Processing

A high-performance, interactive web experience for GLOCAL GUINEE SARLU, showcasing premium Guinean agricultural commodities (Sesame, Raw Cashew Nuts, Cocoa) through advanced 3D visualizations and GSAP animations.

## 🚀 Quick Start

### Local Development
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Open Browser**:
   Navigate to `http://localhost:5173`

### Production Build
To test the production build locally:
```bash
npm run build
npm run preview
```

## 🌐 Deployment (Vercel)

This project is optimized for deployment on **Vercel**.

### Configuration
The project includes a `vercel.json` file that handles:
- **Build Settings**: Automatically runs `npm run build` and serves from the `dist` folder.
- **Security Headers**: Implements strict CSP, XSS protection, and frame options.
- **Performance**: High-performance caching for hashed assets in the `assets/` directory.

### How to Deploy
1. Push your changes to GitHub.
2. Connect your repository to Vercel.
3. The configuration will be automatically detected.

## 🛠️ Tech Stack
- **Vite**: Ultra-fast frontend build tool.
- **GSAP**: Industry-standard animation library.
- **Three.js**: Advanced 3D graphics.
- **Vanilla CSS/JS**: optimized for maximum performance and compatibility.

## 📁 Project Structure
- `src/`: Core logic and 3D component systems.
- `public/`: Static assets (images, videos, icons).
- `index.html`: Main application entry point.
- `main.js`: Primary orchestration and animation logic.
- `style.css`: Comprehensive design system and responsive styles.

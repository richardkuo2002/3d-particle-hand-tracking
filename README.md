# 3D Particle System with Hand Tracking

A real-time interactive 3D particle system that responds to hand gestures. Built with Three.js and MediaPipe.

![Demo Preview](https://raw.githubusercontent.com/richardkuo2002/3d-particle-hand-tracking/main/public/vite.svg)
*(Note: You can replace this with a real screenshot later)*

## 🚀 Live Demo

[https://richardkuo2002.github.io/3d-particle-hand-tracking/](https://richardkuo2002.github.io/3d-particle-hand-tracking/)

## ✨ Features

- **Interactive Hand Tracking**: Control particle expansion and dynamics by closing your hand (detected via webcam).
- **Shape Morphing**: Switch between multiple 3D shapes:
  - ❤️ Heart
  - 🌸 Flower
  - 🪐 Saturn
  - 🧘 Buddha (Abstract)
  - 🎆 Fireworks
- **Customization**: Real-time color adjustment.
- **Modern UI**: Sleek, glassmorphism-inspired interface.

## 🛠️ Tech Stack

- **Three.js**: High-performance 3D graphics.
- **MediaPipe Hands**: Real-time hand tracking and gesture recognition.
- **Vite**: Fast build tool and development server.
- **Vanilla JS**: Lightweight and efficient implementation.

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/richardkuo2002/3d-particle-hand-tracking.git
   cd 3d-particle-hand-tracking
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

## 🎮 How to Use

1. Allow camera access when prompted.
2. Show your hand to the camera.
3. **Open Hand**: Particles stay in their shape.
4. **Close Fist**: Particles expand/explode outwards.
5. Use the UI panel to switch shapes and change colors.

## 📄 License

MIT

# YMCA WebGL MVP

A prototype WebGL application built with Three.js, intended to be hosted directly on GitHub Pages. This repository also houses the initial Apple Xcode project for the native iOS application.

## Overview

This project serves as a Minimal Viable Product (MVP) containing both native Swift components and a responsive web-based 3D scene using static HTML/JS/CSS.

## Running Locally

Since this uses ES Modules for Three.js, you need to run a local web server to avoid CORS issues.

Using Python:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx serve .
```

Then open `http://localhost:8000` (or the URL provided by your server) in your browser.

## Deployment

This web app is designed to be easily deployed to **GitHub Pages**. 
1. Go to your repository settings on GitHub.
2. Navigate to "Pages".
3. Select the `main` branch and `/ (root)` folder (or whichever folder contains your `index.html`).
4. Save and wait for the deployment to finish.

## Tech Stack
- **Web**: HTML5, CSS3, JavaScript (ES6 Modules)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Native**: Swift, Xcode

## License
[MIT License](LICENSE)

# 📱 Document Scanner Pro

A browser-based document scanner built with **pure Computer Vision algorithms** - no external CV libraries!

## ✨ Features

- 📸 **Camera Capture** - Take photos directly from mobile/desktop camera
- 🖼️ **Image Upload** - Support for all image formats (JPG, PNG, WEBP, BMP, GIF, TIFF, SVG)
- 🤖 **Auto Detection** - Automatic document edge detection and perspective correction
- 🎨 **Multiple Modes** - Auto detect, Enhance, or Black & White
- ⚙️ **Adjustable Settings** - Custom contrast and brightness controls
- 📥 **Download Results** - Save processed documents as JPG
- 💻 **Offline-First** - Runs entirely in browser, no backend needed
- 📱 **Mobile-Friendly** - Responsive design for all devices

## Testing demo:
<img width="1283" height="695" alt="image" src="https://github.com/user-attachments/assets/e6e0bbc8-49f3-4b63-9c1f-665505c6e04c" />

## 🔬 Computer Vision Algorithms Implemented

This project implements **10+ classical CV algorithms from scratch** without using OpenCV or any CV libraries:

### Core Algorithms

| # | Algorithm | Purpose | Technique |
|---|-----------|---------|-----------|
| 1 | **Weighted Grayscale** | Color to grayscale conversion | 0.299R + 0.587G + 0.114B |
| 2 | **Histogram Stretching** | Contrast enhancement | Clips 2% outliers, stretches range |
| 3 | **Gaussian Blur** | Noise reduction | 3×3 kernel convolution |
| 4 | **Sobel Operator** | Gradient computation | X & Y directional kernels |
| 5 | **Canny Edge Detection** | Edge detection | Multi-stage pipeline |
| 6 | **Non-Maximum Suppression** | Edge thinning | Gradient direction analysis |
| 7 | **Adaptive Thresholding** | Dynamic edge selection | 15% of max gradient |
| 8 | **Hysteresis Tracking** | Edge connectivity | Strong-weak edge linking |
| 9 | **Contour Tracing** | Boundary detection | 8-connectivity following |
| 10 | **Shoelace Formula** | Area calculation | Polygon area computation |
| 11 | **Corner Detection** | Quadrilateral corners | Extreme point detection |
| 12 | **Perspective Transform** | Image warping | Homography mapping |

---

## 🔄 Algorithm Pipeline
```
Input Image
    ↓
┌─────────────────────────┐
│ Preprocessing           │
│ • Resize to 800px max   │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Grayscale Conversion    │
│ • Weighted RGB formula  │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Contrast Enhancement    │
│ • Histogram stretching  │
│ • Clip 2% extremes      │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Gaussian Blur           │
│ • 3×3 kernel            │
│ • Noise reduction       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Canny Edge Detection    │
│ 1. Sobel gradient       │
│ 2. Non-max suppression  │
│ 3. Adaptive threshold   │
│ 4. Hysteresis tracking  │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Contour Detection       │
│ • 8-connectivity trace  │
│ • Area calculation      │
│ • Find largest contour  │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Corner Detection        │
│ • Extreme points        │
│ • Validate quadrilateral│
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Perspective Transform   │
│ • Map to rectangle      │
│ • Unwarp document       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Enhancement             │
│ • Contrast adjustment   │
│ • Brightness tuning     │
└─────────────────────────┘
    ↓
Output: Clean Scanned Document ✓
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 14+ 
npm or yarn
```

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/document-scanner.git
cd document-scanner

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5174` in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

### Deploy
```bash
# Deploy to Vercel
npm i -g vercel
vercel

# Or deploy to Netlify
npm run build
npx netlify-cli deploy --prod
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>React 18.2, Vite 4.3</td>
</tr>
<tr>
<td><b>Styling</b></td>
<td>Tailwind CSS 3.3</td>
</tr>
<tr>
<td><b>Icons</b></td>
<td>Lucide React</td>
</tr>
<tr>
<td><b>Image Processing</b></td>
<td>HTML Canvas API</td>
</tr>
<tr>
<td><b>Language</b></td>
<td>JavaScript (ES6+)</td>
</tr>
<tr>
<td><b>Libraries</b></td>
<td>Zero CV/ML libraries - Pure algorithms!</td>
</tr>
</table>

---

## 📂 Project Structure
```
document-scanner/
├── src/
│   ├── components/
│   │   └── DocumentScanner.jsx    # Main component (1000+ lines of CV algorithms)
│   ├── styles/
│   │   └── index.css              # Global styles + Tailwind
│   └── main.jsx                    # Entry point
├── public/
│   └── index.html                  # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── README.md                       # You are here!
```

---

## 🎮 Usage Guide

### Step-by-Step Workflow

#### 1️⃣ **Capture/Upload Image**

Three ways to input:
- **"Take Photo"** → Opens native camera (works everywhere)
- **"Upload"** → Select from gallery (all formats supported)
- **"Live Camera"** → Real-time preview (requires HTTPS)

#### 2️⃣ **Choose Processing Mode**

| Mode | Algorithm | Best For |
|------|-----------|----------|
| **Auto (Full CV)** | Complete pipeline with edge detection | Angled documents, receipts, business cards |
| **Enhance** | Contrast + brightness only | Straight photos needing cleanup |
| **Black & White** | Binary thresholding | Text documents, forms, printed materials |

#### 3️⃣ **Fine-Tune Settings** (Optional)

- **Contrast:** 1.0 - 2.0 (default: 1.4)
- **Brightness:** 0 - 50 (default: 15)

#### 4️⃣ **Scan & Download**

- Click **"Scan"** → Watch debug messages show CV pipeline
- Click **"Download"** → Save as JPG


## 🎨 Processing Modes Comparison

| Feature | Auto (Full CV) | Enhance | Black & White |
|---------|---------------|---------|---------------|
| **Algorithms Used** | All 12 | 1 (Linear enhancement) | 2 (Grayscale + threshold) |
| **Processing Time** | ~2-3 seconds | <1 second | <1 second |
| **Edge Detection** | ✅ Yes | ❌ No | ❌ No |
| **Perspective Correction** | ✅ Yes | ❌ No | ❌ No |
| **Best For** | Angled photos | Straight photos | Text documents |
| **Output Quality** | Highest | Medium | High contrast |

## 🐛 Known Issues & Limitations

| Issue | Workaround |
|-------|-----------|
| **Live camera requires HTTPS** | Use "Take Photo" button instead (works everywhere) |
| **Large images (>5MB) slow** | Auto-resizes to 800px for processing |
| **Low-contrast documents fail detection** | Use "Enhance" mode instead |
| **Works best with contrasting backgrounds** | Place document on different colored surface |

## 🏆 Project Highlights

### Why This Project Stands Out

✨ **No Black Boxes** - Every algorithm implemented from scratch  
🎓 **Educational** - Learn CV fundamentals by reading code  
⚡ **Performance** - Optimized for real-time browser processing  
📱 **Accessibility** - Works on any device with a browser  
🔓 **Open Source** - MIT licensed, free to use and modify  

## 🎓 Educational Use

This project is perfect for:

- 🎒 **Students** learning computer vision
- 👨‍🏫 **Educators** teaching image processing
- 💼 **Developers** understanding CV algorithms
- 🔬 **Researchers** prototyping CV pipelines

## Acknowledgments

- **John F. Canny** - For the Canny edge detection algorithm (1986)
- **Sobel & Feldman** - For the Sobel operator (1968)
- **OpenCV Team** - For comprehensive CV documentation
- **React Team** - For the amazing framework
- **Tailwind Labs** - For the utility-first CSS framework
- **CamScanner & Adobe Scan** - For inspiration

---

## ⭐ Show Your Support

If you found this project helpful or interesting:

- ⭐ **Star this repository**
- 🐛 **Report bugs** via Issues
- 💡 **Suggest features** via Issues
- 🔀 **Fork and contribute** via Pull Requests
- 📢 **Share with others** who might find it useful

---
<p align="center">
  <strong>Made with ❤️ and lots of ☕</strong>
</p>

<p align="center">
  <sub>Built with React • Styled with Tailwind • Powered by Mathematics</sub>
</p>

---

**⭐ Don't forget to star this repository if you found it helpful! ⭐**
```

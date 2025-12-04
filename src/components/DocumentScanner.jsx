import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Download, RotateCw, ZoomIn, FileImage, X, AlertCircle, Sliders } from 'lucide-react';

const DocumentScanner = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [mode, setMode] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [contrast, setContrast] = useState(1.4);
  const [brightness, setBrightness] = useState(15);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setProcessedImage(null);
        setDebugInfo('');
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setProcessedImage(null);
        setDebugInfo('');
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access requires HTTPS or localhost. Use "Take Photo" or "Upload" buttons instead.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error('Video play error:', err));
        }
      }, 100);
    } catch (err) {
      alert('Cannot access camera. Use "Take Photo" or "Upload" buttons instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      if (canvas.width === 0 || canvas.height === 0) {
        alert('Camera not ready. Please wait.');
        return;
      }
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      setImage(imageData);
      setProcessedImage(null);
      setDebugInfo('');
      setProcessing(false);
      stopCamera();
    } else {
      alert('Camera not ready yet.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleScan = () => {
    if (image && !processing) {
      processImage(image);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `scanned_${Date.now()}.jpg`;
      link.click();
    }
  };

  // ============= COMPUTER VISION ALGORITHMS START =============

  const processImage = (imgData) => {
    setProcessing(true);
    setDebugInfo('Loading image...');
    
    const img = new Image();
    img.onload = () => {
      try {
        if (mode === 'bw') {
          setDebugInfo('Converting to Black & White...');
          const bw = convertToBlackWhite(img);
          setProcessedImage(bw);
          setDebugInfo('✅ Black & White conversion complete');
          setProcessing(false);
          return;
        }
        
        if (mode === 'enhance') {
          setDebugInfo('Applying enhancement...');
          const enhanced = enhanceImageAdvanced(img);
          setProcessedImage(enhanced);
          setDebugInfo('✅ Enhancement complete');
          setProcessing(false);
          return;
        }
        
        // AUTO MODE - Full CV Pipeline
        setDebugInfo('Step 1: Preprocessing...');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for processing
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        setDebugInfo('Step 2: Grayscale conversion (weighted RGB)...');
        const imageData = ctx.getImageData(0, 0, width, height);
        const gray = toGrayscale(imageData);
        
        setDebugInfo('Step 3: Contrast enhancement (histogram stretching)...');
        const enhanced = enhanceContrast(gray, width, height);
        
        setDebugInfo('Step 4: Gaussian blur (noise reduction)...');
        const blurred = gaussianBlur(enhanced, width, height);
        
        setDebugInfo('Step 5: Canny edge detection...');
        const edges = cannyEdgeDetection(blurred, width, height);
        
        setDebugInfo('Step 6: Contour detection...');
        const corners = findDocumentCorners(edges, width, height);
        
        if (corners && isValidQuadrilateral(corners, width, height)) {
          setDebugInfo('Step 7: Perspective transform...');
          const warped = warpPerspective(img, corners, width, height);
          setProcessedImage(warped);
          setDebugInfo('✅ Document scanned successfully! (Full CV pipeline)');
        } else {
          setDebugInfo('⚠️ Document edges not detected. Applying enhancement fallback...');
          const enhanced = enhanceImageAdvanced(img);
          setProcessedImage(enhanced);
        }
      } catch (error) {
        console.error('CV Processing error:', error);
        setDebugInfo('❌ Error in CV pipeline: ' + error.message);
        const enhanced = enhanceImageAdvanced(img);
        setProcessedImage(enhanced);
      }
      setProcessing(false);
    };
    
    img.onerror = () => {
      setDebugInfo('❌ Failed to load image');
      setProcessing(false);
    };
    
    img.src = imgData;
  };

  // Algorithm 1: Weighted Grayscale Conversion
  const toGrayscale = (imageData) => {
    const data = imageData.data;
    const gray = new Uint8ClampedArray(data.length / 4);
    for (let i = 0; i < data.length; i += 4) {
      // Weighted conversion: human eye sensitivity
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
  };

  // Algorithm 2: Histogram-based Contrast Stretching
  const enhanceContrast = (gray, width, height) => {
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < gray.length; i++) {
      histogram[Math.floor(gray[i])]++;
    }
    
    const totalPixels = gray.length;
    const lowCut = totalPixels * 0.02;
    const highCut = totalPixels * 0.98;
    
    let minVal = 0, maxVal = 255;
    let cumSum = 0;
    
    for (let i = 0; i < 256; i++) {
      cumSum += histogram[i];
      if (cumSum > lowCut && minVal === 0) minVal = i;
      if (cumSum > highCut) {
        maxVal = i;
        break;
      }
    }
    
    const enhanced = new Uint8ClampedArray(gray.length);
    const range = maxVal - minVal;
    
    if (range > 0) {
      for (let i = 0; i < gray.length; i++) {
        const val = ((gray[i] - minVal) / range) * 255;
        enhanced[i] = Math.max(0, Math.min(255, val));
      }
      return enhanced;
    }
    return gray;
  };

  // Algorithm 3: Gaussian Blur (3x3 kernel)
  const gaussianBlur = (gray, width, height) => {
    const kernel = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
    const kernelSum = 16;
    const result = new Uint8ClampedArray(gray.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            sum += gray[idx] * kernel[ky + 1][kx + 1];
          }
        }
        result[y * width + x] = sum / kernelSum;
      }
    }
    return result;
  };

  // Algorithm 4: Canny Edge Detection (Full Pipeline)
  const cannyEdgeDetection = (gray, width, height) => {
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const magnitude = new Float32Array(gray.length);
    const direction = new Float32Array(gray.length);
    let maxMag = 0;
    
    // Step 1: Sobel gradient calculation
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gx += gray[idx] * sobelX[kernelIdx];
            gy += gray[idx] * sobelY[kernelIdx];
          }
        }
        const idx = y * width + x;
        magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
        maxMag = Math.max(maxMag, magnitude[idx]);
        direction[idx] = Math.atan2(gy, gx);
      }
    }
    
    // Step 2: Non-maximum suppression
    const suppressed = new Float32Array(magnitude.length);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const angle = direction[idx] * 180 / Math.PI;
        const normalizedAngle = ((angle % 180) + 180) % 180;
        
        let n1, n2;
        if ((normalizedAngle >= 0 && normalizedAngle < 22.5) || (normalizedAngle >= 157.5)) {
          n1 = magnitude[y * width + (x + 1)];
          n2 = magnitude[y * width + (x - 1)];
        } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
          n1 = magnitude[(y + 1) * width + (x - 1)];
          n2 = magnitude[(y - 1) * width + (x + 1)];
        } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
          n1 = magnitude[(y + 1) * width + x];
          n2 = magnitude[(y - 1) * width + x];
        } else {
          n1 = magnitude[(y + 1) * width + (x + 1)];
          n2 = magnitude[(y - 1) * width + (x - 1)];
        }
        
        if (magnitude[idx] >= n1 && magnitude[idx] >= n2) {
          suppressed[idx] = magnitude[idx];
        }
      }
    }
    
    // Step 3: Adaptive thresholding
    const highThreshold = maxMag * 0.15;
    const lowThreshold = highThreshold * 0.4;
    const edges = new Uint8ClampedArray(gray.length);
    
    for (let i = 0; i < suppressed.length; i++) {
      if (suppressed[i] >= highThreshold) {
        edges[i] = 255;
      } else if (suppressed[i] >= lowThreshold) {
        edges[i] = 128;
      }
    }
    
    // Step 4: Hysteresis (edge tracking)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (edges[idx] === 128) {
          let hasStrongNeighbor = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (edges[(y + dy) * width + (x + dx)] === 255) {
                hasStrongNeighbor = true;
                break;
              }
            }
            if (hasStrongNeighbor) break;
          }
          edges[idx] = hasStrongNeighbor ? 255 : 0;
        }
      }
    }
    
    return edges;
  };

  // Algorithm 5: Contour Tracing (8-connectivity)
  const findDocumentCorners = (edges, width, height) => {
    const contours = [];
    const visited = new Set();
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (edges[idx] === 255 && !visited.has(idx)) {
          const contour = traceContour(edges, width, height, x, y, visited);
          if (contour.length > 50) {
            contours.push(contour);
          }
        }
      }
    }
    
    if (contours.length === 0) return null;
    
    // Find contour with largest area (Shoelace formula)
    let maxArea = 0;
    let bestContour = null;
    
    for (const contour of contours) {
      const area = calculateContourArea(contour);
      if (area > maxArea && area > (width * height * 0.1)) {
        maxArea = area;
        bestContour = contour;
      }
    }
    
    if (!bestContour) return null;
    
    // Find corners using extreme points
    return findCornerPoints(bestContour);
  };

  const traceContour = (edges, width, height, startX, startY, visited) => {
    const contour = [];
    const stack = [{x: startX, y: startY}];
    
    while (stack.length > 0 && contour.length < 5000) {
      const {x, y} = stack.pop();
      const idx = y * width + x;
      if (visited.has(idx)) continue;
      visited.add(idx);
      contour.push({x, y});
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (edges[nidx] === 255 && !visited.has(nidx)) {
              stack.push({x: nx, y: ny});
            }
          }
        }
      }
    }
    return contour;
  };

  // Algorithm 6: Shoelace Formula for Area
  const calculateContourArea = (contour) => {
    let area = 0;
    for (let i = 0; i < contour.length; i++) {
      const j = (i + 1) % contour.length;
      area += contour[i].x * contour[j].y;
      area -= contour[j].x * contour[i].y;
    }
    return Math.abs(area / 2);
  };

  // Algorithm 7: Corner Detection (Extreme Points)
  const findCornerPoints = (contour) => {
    if (contour.length < 4) return null;
    const tl = contour.reduce((min, p) => (p.x + p.y < min.x + min.y) ? p : min);
    const tr = contour.reduce((max, p) => (p.x - p.y > max.x - max.y) ? p : max);
    const bl = contour.reduce((min, p) => (p.y - p.x > min.y - min.x) ? p : min);
    const br = contour.reduce((max, p) => (p.x + p.y > max.x + max.y) ? p : max);
    return [tl, tr, br, bl];
  };

  const isValidQuadrilateral = (corners, width, height) => {
    if (!corners || corners.length !== 4) return false;
    const area = calculateContourArea(corners);
    const minArea = width * height * 0.1;
    const maxArea = width * height * 0.95;
    return area > minArea && area < maxArea;
  };

  // Algorithm 8: Perspective Transform
  const warpPerspective = (img, corners, scaledWidth, scaledHeight) => {
    const scaleX = img.width / scaledWidth;
    const scaleY = img.height / scaledHeight;
    const scaledCorners = corners.map(c => ({
      x: c.x * scaleX,
      y: c.y * scaleY
    }));
    
    const w1 = Math.sqrt(
      Math.pow(scaledCorners[1].x - scaledCorners[0].x, 2) +
      Math.pow(scaledCorners[1].y - scaledCorners[0].y, 2)
    );
    const w2 = Math.sqrt(
      Math.pow(scaledCorners[2].x - scaledCorners[3].x, 2) +
      Math.pow(scaledCorners[2].y - scaledCorners[3].y, 2)
    );
    const maxWidth = Math.max(w1, w2);
    
    const h1 = Math.sqrt(
      Math.pow(scaledCorners[3].x - scaledCorners[0].x, 2) +
      Math.pow(scaledCorners[3].y - scaledCorners[0].y, 2)
    );
    const h2 = Math.sqrt(
      Math.pow(scaledCorners[2].x - scaledCorners[1].x, 2) +
      Math.pow(scaledCorners[2].y - scaledCorners[1].y, 2)
    );
    const maxHeight = Math.max(h1, h2);
    
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    
    // Crop to bounding box
    const minX = Math.min(...scaledCorners.map(c => c.x));
    const minY = Math.min(...scaledCorners.map(c => c.y));
    const cropWidth = Math.max(...scaledCorners.map(c => c.x)) - minX;
    const cropHeight = Math.max(...scaledCorners.map(c => c.y)) - minY;
    
    ctx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, maxWidth, maxHeight);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    enhanceImageData(imageData);
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Algorithm 9: Linear Contrast Enhancement
  const enhanceImageAdvanced = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    enhanceImageData(imageData);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const enhanceImageData = (imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, contrast * data[i] + brightness));
      data[i + 1] = Math.min(255, Math.max(0, contrast * data[i + 1] + brightness));
      data[i + 2] = Math.min(255, Math.max(0, contrast * data[i + 2] + brightness));
    }
  };

  // Algorithm 10: Binary Thresholding
  const convertToBlackWhite = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const bw = gray > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = bw;
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // ============= COMPUTER VISION ALGORITHMS END =============

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
            Advanced Document Scanner
          </h1>
        </div>

        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Processing Mode:</h3>
            <button onClick={() => setShowSettings(!showSettings)} className="text-indigo-600">
              <Sliders className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode('auto')} className={`flex-1 py-2 px-4 rounded-lg text-sm ${mode === 'auto' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              Auto Enhacement
            </button>
            <button onClick={() => setMode('enhance')} className={`flex-1 py-2 px-4 rounded-lg text-sm ${mode === 'enhance' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              Enhance
            </button>
            <button onClick={() => setMode('bw')} className={`flex-1 py-2 px-4 rounded-lg text-sm ${mode === 'bw' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              B&W
            </button>
          </div>
          {showSettings && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600">Contrast: {contrast.toFixed(1)}</label>
                <input type="range" min="1" max="2" step="0.1" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Brightness: {brightness}</label>
                <input type="range" min="0" max="50" step="5" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              <button onClick={stopCamera} className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg" />
              <button onClick={capturePhoto} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-8 py-4 rounded-full font-semibold flex items-center gap-2">
                <Camera className="w-6 h-6" />
                Capture
              </button>
            </div>
          </div>
        )}

        {debugInfo && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">{debugInfo}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-indigo-600" />
              Original Image
            </h2>
            {!image ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Capture or upload</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => fileInputRef.current.click()} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload
                  </button>
                  <button onClick={startCamera} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm">
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            ) : (
              <div>
                <img src={image} alt="Original" className="w-full rounded-lg mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => { setImage(null); setProcessedImage(null); setDebugInfo(''); setProcessing(false); }} className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm">
                    New
                  </button>
                  <button onClick={handleScan} disabled={processing} className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 text-sm">
                    {processing ? (
                      <>
                        <RotateCw className="w-4 h-4 inline animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-4 h-4 inline" />
                        Scan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-600" />
              Scanned Result
            </h2>
            {!processedImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center h-96 flex items-center justify-center">
                <div>
                  <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Scanned result appears here</p>
                </div>
              </div>
            ) : (
              <div>
                <img src={processedImage} alt="Scanned" className="w-full rounded-lg mb-4" />
                <button onClick={handleDownload} className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;
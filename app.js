// Facade Designer v2 - Stable Version

const MATERIALS = [
    { id: 'crete', name: 'Crépi Blanc', color: '#F5F5DC', price: 80 },
    { id: 'paint_white', name: 'Peinture Blanche', color: '#FFFFFF', price: 50 },
    { id: 'paint_beige', name: 'Peinture Beige', color: '#F5F5DC', price: 50 },
    { id: 'paint_blue', name: 'Peinture Bleue', color: '#4169E1', price: 50 },
    { id: 'paint_green', name: 'Peinture Verte', color: '#228B22', price: 50 },
    { id: 'paint_gray', name: 'Peinture Grise', color: '#808080', price: 50 },
    { id: 'brick', name: 'Brique Rouge', color: '#B22222', price: 120 },
    { id: 'stone', name: 'Pierre Grise', color: '#A9A9A9', price: 200 },
    { id: 'wood', name: 'Bois Clair', color: '#DEB887', price: 180 },
    { id: 'modern', name: 'Béton Moderne', color: '#505050', price: 150 },
    { id: 'tile', name: 'Carrelage', color: '#CD853F', price: 220 },
    { id: 'yellow', name: 'Façade Jaune', color: '#FFD700', price: 60 },
];

let originalImage = null;
let canvas, ctx;
let currentImage = null;
let history = [];
let selectedMaterial = MATERIALS[0];
let mode = 'paint';

// Init
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    generateColors();
});

function generateColors() {
    const grid = document.getElementById('colorGrid');
    grid.innerHTML = '';
    MATERIALS.forEach((mat, idx) => {
        const btn = document.createElement('button');
        btn.className = 'color-btn' + (idx === 0 ? ' active' : '');
        btn.innerHTML = `
            <div class="color-preview" style="background:${mat.color}"></div>
            <div>${mat.name}</div>
            <div style="font-size:10px;color:#aaa">${mat.price} DH/m²</div>
        `;
        btn.onclick = () => selectMaterial(mat, btn);
        grid.appendChild(btn);
    });
}

function selectMaterial(mat, btn) {
    selectedMaterial = mat;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updatePrice();
}

function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('uploadBox').style.display = 'none';
    document.getElementById('loading').classList.add('active');

    const reader = new FileReader();
    reader.onload = function(evt) {
        originalImage = new Image();
        originalImage.onload = function() {
            // Resize canvas
            const maxWidth = 800;
            const scale = Math.min(1, maxWidth / originalImage.width);
            canvas.width = originalImage.width * scale;
            canvas.height = originalImage.height * scale;

            // Draw image
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

            // Save current state
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            saveHistory();

            // Show editor
            document.getElementById('loading').classList.remove('active');
            document.getElementById('editor').classList.add('active');

            // Calculate surface (approximation)
            const surface = Math.round((canvas.width * canvas.height) / 10000);
            document.getElementById('surface').textContent = surface + ' m²';
            updatePrice();
        };
        originalImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
}

function setMode(m) {
    mode = m;
    document.querySelectorAll('.tool-btn').forEach(b => b.style.opacity = '0.7');
    event.target.style.opacity = '1';
}

function saveHistory() {
    if (currentImage) {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (history.length > 10) history.shift();
    }
}

function undo() {
    if (history.length > 1) {
        history.pop();
        const prev = history[history.length - 1];
        ctx.putImageData(prev, 0, 0);
        currentImage = prev;
    }
}

function resetImage() {
    if (originalImage) {
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        saveHistory();
    }
}

function exportImage() {
    const link = document.createElement('a');
    link.download = 'ma-facade-design.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function updatePrice() {
    const surfaceText = document.getElementById('surface').textContent;
    const surface = parseInt(surfaceText) || 0;
    const matPrice = selectedMaterial.price;
    const laborPrice = surface * 150;
    const total = (surface * matPrice) + laborPrice;

    document.getElementById('matPrice').textContent = matPrice + ' DH/m²';
    document.getElementById('laborPrice').textContent = laborPrice.toLocaleString() + ' DH';
    document.getElementById('totalPrice').textContent = total.toLocaleString() + ' DH';
}

// Paint on canvas
canvas.addEventListener('click', function(e) {
    if (!currentImage || mode !== 'paint') return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));

    // Save before painting
    saveHistory();

    // Simple flood fill (bucket fill approximation)
    floodFill(x, y, selectedMaterial.color);

    // Update current image
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    updatePrice();
});

function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Get target color at start position
    const targetIdx = (startY * width + startX) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];

    // Parse fill color
    const fillRGB = hexToRgb(fillColor);
    if (!fillRGB) return;

    // Tolerance for color matching
    const tolerance = 30;

    // Stack-based flood fill
    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = x + ',' + y;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (visited.has(key)) continue;

        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Check if color is similar to target
        if (Math.abs(r - targetR) > tolerance || 
            Math.abs(g - targetG) > tolerance || 
            Math.abs(b - targetB) > tolerance) {
            continue;
        }

        // Fill
        data[idx] = fillRGB.r;
        data[idx + 1] = fillRGB.g;
        data[idx + 2] = fillRGB.b;

        visited.add(key);

        // Add neighbors
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

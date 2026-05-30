// Facade AI Designer - Version Mix (Simple + AI + Export)

// Données
const MATERIALS = [
    { id: 'brick', name: 'Brique Rouge', color: '#B22222', price: 120, type: 'wall' },
    { id: 'stone', name: 'Pierre Grise', color: '#A9A9A9', price: 200, type: 'wall' },
    { id: 'wood', name: 'Bois Clair', color: '#DEB887', price: 180, type: 'wall' },
    { id: 'crete', name: 'Crépi Blanc', color: '#F5F5DC', price: 80, type: 'wall' },
    { id: 'modern', name: 'Béton Moderne', color: '#505050', price: 150, type: 'wall' },
    { id: 'tile', name: 'Carrelage', color: '#CD853F', price: 220, type: 'wall' },
    { id: 'paint_white', name: 'Peinture Blanche', color: '#FFFFFF', price: 50, type: 'paint' },
    { id: 'paint_blue', name: 'Peinture Bleue', color: '#4169E1', price: 50, type: 'paint' },
    { id: 'paint_green', name: 'Peinture Verte', color: '#228B22', price: 50, type: 'paint' },
];

const WINDOW_STYLES = [
    { id: 'classic', name: 'Classique', color: '#87CEEB', price: 2500 },
    { id: 'modern', name: 'Moderne', color: '#2F4F4F', price: 3500 },
    { id: 'wood', name: 'Bois', color: '#8B4513', price: 3000 },
    { id: 'aluminum', name: 'Aluminium', color: '#C0C0C0', price: 4000 },
];

const DOOR_STYLES = [
    { id: 'wood', name: 'Bois Massif', color: '#8B4513', price: 3500 },
    { id: 'metal', name: 'Métal', color: '#696969', price: 4500 },
    { id: 'glass', name: 'Vitée', color: '#87CEEB', price: 5500 },
];

// Variables globales
let uploadedImage = null;
let canvas, ctx;
let detectedElements = [];
let selectedElement = null;
let selectedMaterial = null;
let wallArea = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');
    generateUI();
});

// Générer l'UI
function generateUI() {
    // Materials
    const materialsGrid = document.getElementById('materialsGrid');
    MATERIALS.forEach(mat => {
        const btn = document.createElement('button');
        btn.className = 'material-btn';
        btn.innerHTML = `
            <div class="material-color" style="background: ${mat.color}"></div>
            <div class="material-name">${mat.name}</div>
            <div style="font-size:10px;color:#aaa">${mat.price} DH/m²</div>
        `;
        btn.onclick = () => selectMaterial(mat, btn);
        materialsGrid.appendChild(btn);
    });
}

// Handle Upload
function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = new Image();
        uploadedImage.onload = function() {
            startAIProcessing();
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// AI Processing (Simulation)
function startAIProcessing() {
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('aiProcessing').classList.add('active');

    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    let currentStep = 0;

    function processStep() {
        if (currentStep < steps.length) {
            document.getElementById(steps[currentStep]).classList.add('done');
            document.getElementById(steps[currentStep]).querySelector('.ai-step-icon').textContent = '✅';
            currentStep++;
            setTimeout(processStep, 800);
        } else {
            setTimeout(showEditor, 500);
        }
    }

    setTimeout(processStep, 500);
}

// Show Editor
function showEditor() {
    document.getElementById('aiProcessing').classList.remove('active');
    document.getElementById('editorSection').classList.add('active');

    // Setup canvas
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;

    // Draw original image
    ctx.drawImage(uploadedImage, 0, 0);

    // Simulate AI detection
    simulateAIDetection();

    // Calculate wall area
    calculateWallArea();
}

// Simulate AI Detection
function simulateAIDetection() {
    // Simulate detected elements based on image size
    const imgWidth = uploadedImage.width;
    const imgHeight = uploadedImage.height;

    detectedElements = [
        {
            id: 'wall_main',
            type: 'wall',
            name: 'Mur Principal',
            x: imgWidth * 0.1,
            y: imgHeight * 0.2,
            width: imgWidth * 0.8,
            height: imgHeight * 0.6,
            color: '#F5F5DC',
            material: 'crete',
            price: 0
        },
        {
            id: 'window_1',
            type: 'window',
            name: 'Fenêtre 1',
            x: imgWidth * 0.2,
            y: imgHeight * 0.35,
            width: imgWidth * 0.15,
            height: imgHeight * 0.2,
            color: '#87CEEB',
            style: 'classic',
            price: 2500
        },
        {
            id: 'window_2',
            type: 'window',
            name: 'Fenêtre 2',
            x: imgWidth * 0.65,
            y: imgHeight * 0.35,
            width: imgWidth * 0.15,
            height: imgHeight * 0.2,
            color: '#87CEEB',
            style: 'classic',
            price: 2500
        },
        {
            id: 'door_main',
            type: 'door',
            name: 'Porte Principale',
            x: imgWidth * 0.42,
            y: imgHeight * 0.5,
            width: imgWidth * 0.16,
            height: imgHeight * 0.3,
            color: '#8B4513',
            style: 'wood',
            price: 3500
        }
    ];

    // Generate detected elements UI
    generateDetectedElementsUI();

    // Draw detection boxes
    drawDetectionBoxes();
}

// Generate Detected Elements UI
function generateDetectedElementsUI() {
    const container = document.getElementById('detectedElements');
    container.innerHTML = '';

    detectedElements.forEach(el => {
        const item = document.createElement('div');
        item.className = 'detected-item';
        item.dataset.id = el.id;
        item.innerHTML = `
            <div class="detected-info">
                <div class="detected-color" style="background: ${el.color}"></div>
                <div>
                    <div class="detected-name">${el.name}</div>
                    <div class="detected-type">${el.type.toUpperCase()}</div>
                </div>
            </div>
            <span style="font-size:12px;color:#888">${el.price} DH</span>
        `;
        item.onclick = () => selectElement(el.id, item);
        container.appendChild(item);
    });
}

// Draw Detection Boxes
function drawDetectionBoxes() {
    ctx.drawImage(uploadedImage, 0, 0);

    detectedElements.forEach(el => {
        // Draw semi-transparent overlay
        ctx.fillStyle = el.color + '40'; // 25% opacity
        ctx.fillRect(el.x, el.y, el.width, el.height);

        // Draw border
        ctx.strokeStyle = el.id === selectedElement ? '#e94560' : '#fff';
        ctx.lineWidth = el.id === selectedElement ? 3 : 1;
        ctx.strokeRect(el.x, el.y, el.width, el.height);

        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText(el.name, el.x, el.y - 5);
    });
}

// Select Element
function selectElement(id, elementUI) {
    selectedElement = id;

    // Update UI
    document.querySelectorAll('.detected-item').forEach(item => {
        item.classList.remove('selected');
    });
    if (elementUI) elementUI.classList.add('selected');

    // Redraw canvas
    drawDetectionBoxes();
}

// Select Material
function selectMaterial(material, btn) {
    selectedMaterial = material;

    // Update UI
    document.querySelectorAll('.material-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');

    // Apply to selected element
    if (selectedElement) {
        const el = detectedElements.find(e => e.id === selectedElement);
        if (el && el.type === 'wall') {
            el.color = material.color;
            el.material = material.id;
            drawDetectionBoxes();
            updatePrice();

            // Update UI color
            const uiItem = document.querySelector(`[data-id="${selectedElement}"]`);
            if (uiItem) {
                uiItem.querySelector('.detected-color').style.background = material.color;
            }
        }
    }
}

// Calculate Wall Area
function calculateWallArea() {
    const wall = detectedElements.find(e => e.type === 'wall');
    if (wall) {
        // Convert pixels to m² (approximation)
        wallArea = Math.round((wall.width * wall.height) / 10000);
        document.getElementById('wallArea').textContent = wallArea + ' m²';
        updatePrice();
    }
}

// Update Price
function updatePrice() {
    const wall = detectedElements.find(e => e.type === 'wall');
    let materialPrice = 0;

    if (wall && selectedMaterial) {
        materialPrice = wallArea * selectedMaterial.price;
    }

    const laborPrice = wallArea * 150; // 150 DH/m² main d'œuvre
    const totalPrice = materialPrice + laborPrice;

    document.getElementById('materialPrice').textContent = materialPrice.toLocaleString() + ' DH';
    document.getElementById('laborPrice').textContent = laborPrice.toLocaleString() + ' DH';
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString() + ' DH';
}

// Export PNG
function exportPNG() {
    const link = document.createElement('a');
    link.download = 'ma-facade-design.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Export DXF (Simplified)
function exportDXF() {
    // Generate simple DXF content
    let dxf = '0
SECTION
2
HEADER
0
ENDSEC
2
ENTITIES
';

    detectedElements.forEach(el => {
        dxf += `0
LINE
8
${el.type}
10
${el.x}
20
${el.y}
11
${el.x + el.width}
21
${el.y}
`;
        dxf += `0
LINE
8
${el.type}
10
${el.x + el.width}
20
${el.y}
11
${el.x + el.width}
21
${el.y + el.height}
`;
        dxf += `0
LINE
8
${el.type}
10
${el.x + el.width}
20
${el.y + el.height}
11
${el.x}
21
${el.y + el.height}
`;
        dxf += `0
LINE
8
${el.type}
10
${el.x}
20
${el.y + el.height}
11
${el.x}
21
${el.y}
`;
    });

    dxf += '0
ENDSEC
0
EOF
';

    const blob = new Blob([dxf], { type: 'application/dxf' });
    const link = document.createElement('a');
    link.download = 'ma-facade.dxf';
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Export PDF (Simplified)
function exportPDF() {
    // Create a simple HTML representation for PDF
    const pdfContent = `
        <html>
        <head><title>Devis Façade</title></head>
        <body style="font-family:Arial;padding:40px">
            <h1>🏠 Devis Façade Designer</h1>
            <h2>Détail des éléments détectés:</h2>
            <ul>
                ${detectedElements.map(el => `
                    <li><strong>${el.name}</strong> (${el.type}) - ${el.price} DH</li>
                `).join('')}
            </ul>
            <h2>Estimation:</h2>
            <p>Surface: ${wallArea} m²</p>
            <p>Matériaux: ${document.getElementById('materialPrice').textContent}</p>
            <p>Main d'œuvre: ${document.getElementById('laborPrice').textContent}</p>
            <h2>Total: ${document.getElementById('totalPrice').textContent}</h2>
            <p style="margin-top:40px;color:#888">Généré par Facade AI Designer</p>
        </body>
        </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = 'devis-facade.html';
    link.href = URL.createObjectURL(blob);
    link.click();
}

// Canvas click handler
canvas.addEventListener('click', function(e) {
    if (!detectedElements.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Check if click is inside any element
    for (let el of detectedElements) {
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
            selectElement(el.id, document.querySelector(`[data-id="${el.id}"]`));
            return;
        }
    }
});

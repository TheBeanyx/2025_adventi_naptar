const container = document.getElementById('lightTreeGame');
const message = document.getElementById('lightTreeMessage');
const gameInfo = document.getElementById('gameInfo');
const nextLevelButton = document.getElementById('nextLevelButton');

// Globális állapot
let tiles = [];
let rows, cols, totalTiles, gridSize;
let currentLevel = 1;
let targetIndices = []; 

// Vezetékdarabok definíciója: [Fel (0), Jobb (1), Le (2), Bal (3)]
const pieceTypes = {
    'I': { exits: [true, false, true, false], segments: [0, 2, 4] },   
    'L': { exits: [true, true, false, false], segments: [0, 1, 4] },   
    'T': { exits: [false, true, true, true], segments: [1, 2, 3, 4] }, 
    'X': { exits: [true, true, true, true], segments: [0, 1, 2, 3, 4] } 
};
const typeKeys = Object.keys(pieceTypes);


// A szint betöltő logikája
function loadLevel(level) {
    currentLevel = level;
    tiles = []; 
    nextLevelButton.style.display = 'none';

    if (level === 1) {
        // --- SZINT 1: Sötét indulás (garantált forgatás) ---
        rows = 1; cols = 4; totalTiles = rows * cols; gridSize = cols;
        targetIndices = [totalTiles - 1]; 
        gameInfo.textContent = "Szint 1 (1x4): Helyezd el az egyenes csöveket!";
        nextLevelButton.textContent = "Következő Szint (2x3)";

        for (let i = 0; i < totalTiles; i++) {
            let isFixed = (i === 0 || i === totalTiles - 1);
            // Garantáltan kell forgatni: a középső elemek függőlegesen állnak (0 fok)
            let rotation = (i > 0 && i < totalTiles - 1) ? 0 : 90; 
            tiles.push({ index: i, type: 'I', rotation: rotation, isFixed: isFixed });
        }
    } else if (level === 2) {
        // --- SZINT 2: Sötét indulás (garantált forgatás) ---
        rows = 2; cols = 3; totalTiles = rows * cols; gridSize = cols;
        targetIndices = [totalTiles - 1]; 
        gameInfo.textContent = "Szint 2 (2x3): Kanyarok bevezetése! Keresd a helyes utat.";
        nextLevelButton.textContent = "Következő Szint (4x4)";

        for (let i = 0; i < totalTiles; i++) {
            let typeKey, rotation;
            let isFixed = (i === 0 || i === totalTiles - 1);
            
            if (i === 0) { typeKey = 'L'; rotation = 90; } 
            else if (i === totalTiles - 1) { typeKey = 'L'; rotation = 270; } 
            else { 
                typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
                // Garantáltan kell forgatni: Legalább 1x el kell fordulnia (90, 180, vagy 270 fok)
                rotation = (Math.floor(Math.random() * 3) + 1) * 90; 
                isFixed = false; 
            }

            tiles.push({ index: i, type: typeKey, rotation: rotation, isFixed: isFixed });
        }
    } else if (level === 3) {
        // --- SZINT 3: Sötét indulás (garantált forgatás) ---
        rows = 4; cols = 4; totalTiles = rows * cols; gridSize = cols;
        targetIndices = [totalTiles - 1]; 
        gameInfo.textContent = "Szint 3 (4x4): A teljes Karácsonyfa! Vezesd át az áramot a sarkok között.";
        nextLevelButton.textContent = "Következő Szint (Több égő)";

        for (let i = 0; i < totalTiles; i++) {
            let typeKey, rotation;
            let isFixed = (i === 0 || i === totalTiles - 1);
            
            if (i === 0) { typeKey = 'L'; rotation = 90; } 
            else if (i === totalTiles - 1) { typeKey = 'L'; rotation = 270; } 
            else { 
                typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
                // Garantáltan kell forgatni
                rotation = (Math.floor(Math.random() * 3) + 1) * 90; 
                isFixed = false; 
            }

            tiles.push({ index: i, type: typeKey, rotation: rotation, isFixed: isFixed });
        }
    } else if (level === 4) {
        // --- SZINT 4: Sötét indulás (garantált forgatás) ---
        rows = 4; cols = 4; totalTiles = rows * cols; gridSize = cols;
        // Két célpont: Jobb felső sarok (3) és Jobb alsó sarok (15)
        targetIndices = [3, totalTiles - 1]; 
        gameInfo.textContent = "Szint 4 (4x4): Két égőt kell megvilágítanod! Készíts elágazást!";
        nextLevelButton.textContent = "Kész! (Vége)";
        
        for (let i = 0; i < totalTiles; i++) {
            let typeKey, rotation;
            let isFixed = (i === 0 || targetIndices.includes(i));
            
            if (i === 0) { // START
                // Blokkolt állás, forgatni kell a folytatáshoz
                typeKey = 'L'; rotation = 270; 
            } else if (targetIndices.includes(i)) { // END points (3 and 15)
                if (i === 3) { 
                    typeKey = 'L'; rotation = 180; 
                } else { 
                    typeKey = 'L'; rotation = 270; 
                }
            } else { 
                typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
                // Garantáltan kell forgatni
                rotation = (Math.floor(Math.random() * 3) + 1) * 90; 
                isFixed = false; 
            }

            tiles.push({ index: i, type: typeKey, rotation: rotation, isFixed: isFixed });
        }
    } else {
        gameInfo.textContent = "Gratulálok! Minden kihívást megoldottál! Jöhet a következő adventi nap!";
        return; 
    }
    
    message.textContent = "Helytelen kapcsolás!";
    message.style.color = "#c0392b";
    buildBoard();
    checkFlow();
}

// Rotáció kezelése (változatlan)
function getRotatedExits(tile) {
    const baseExits = pieceTypes[tile.type].exits;
    const steps = tile.rotation / 90;
    const rotatedExits = [...baseExits];
    for(let i=0; i < steps; i++) {
        rotatedExits.unshift(rotatedExits.pop());
    }
    return rotatedExits;
}

// Pálya felépítése (változatlan)
function buildBoard() {
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 80px)`;
    container.style.gridTemplateRows = `repeat(${rows}, 80px)`;

    tiles.forEach(tile => {
        const tileDiv = document.createElement('div');
        tileDiv.classList.add('wire-tile');
        tileDiv.dataset.index = tile.index;
        
        const isStart = tile.index === 0;
        const isEnd = targetIndices.includes(tile.index); 

        if (isStart) { tileDiv.classList.add('start'); tileDiv.textContent = 'START'; } 
        else if (isEnd) { tileDiv.classList.add('end'); tileDiv.textContent = 'ÉGŐ'; } 
        
        const isSpecialTile = isStart || isEnd;

        if (!isSpecialTile) {
            const graphic = document.createElement('div');
            graphic.classList.add('wire-graphic');
            graphic.style.transform = `rotate(${tile.rotation}deg)`;
            
            pieceTypes[tile.type].segments.forEach(dir => {
                const segment = document.createElement('div');
                segment.classList.add('wire-segment');
                segment.dataset.dir = dir; 
                graphic.appendChild(segment);
            });
            
            tileDiv.appendChild(graphic);
        }

        if (!tile.isFixed) {
            tileDiv.addEventListener('click', () => {
                tile.rotation = (tile.rotation + 90) % 360;
                const graphic = tileDiv.querySelector('.wire-graphic');
                if (graphic) {
                    graphic.style.transform = `rotate(${tile.rotation}deg)`;
                }
                checkFlow();
            });
        }
        container.appendChild(tileDiv);
    });
}


// Áramlás ellenőrzése és vizuális frissítés
function checkFlow() {
    let flowQueue = []; 
    let visitedTiles = new Set();
    const solvedTargets = new Set(); 

    nextLevelButton.style.display = 'none'; 
    
    const startTile = tiles[0];
    const startExits = getRotatedExits(startTile);

    // Kezdeti áram indítása (fentről és balról)
    // A logikát úgy tartjuk meg, hogy a START csempe kifelé irányuló ágai alapján induljon a flow
    if (startExits[1] || startExits[2]) {
        flowQueue.push({ tile: startTile, entryPort: 3 }); 
        visitedTiles.add(startTile.index);
    }

    const neighborDeltas = [-gridSize, 1, gridSize, -1]; 
    const tileDivs = container.querySelectorAll('.wire-tile');

    while (flowQueue.length > 0) {
        const currentFlow = flowQueue.shift();
        const currentTile = currentFlow.tile;
        const currentIndex = currentTile.index;
        const entryPort = currentFlow.entryPort;

        if (targetIndices.includes(currentIndex)) {
            solvedTargets.add(currentIndex);
        }

        const currentExits = getRotatedExits(currentTile);
        
        for (let nextExitIndex = 0; nextExitIndex < 4; nextExitIndex++) {
            if (nextExitIndex === entryPort) continue;
            if (!currentExits[nextExitIndex]) continue;
            
            // Csak vízszintes áramlás az 1. szinten (ha szükséges a korlátozás)
            if (currentLevel === 1 && (nextExitIndex === 0 || nextExitIndex === 2)) continue; 

            const neighborIndex = currentIndex + neighborDeltas[nextExitIndex];
            const col = currentIndex % cols; 
            
            // Határellenőrzés
            if (neighborIndex < 0 || neighborIndex >= totalTiles) continue;
            if (nextExitIndex === 1 && col === cols - 1) continue; 
            if (nextExitIndex === 3 && col === 0) continue;          

            const neighborTile = tiles[neighborIndex];
            const neighborExits = getRotatedExits(neighborTile);
            const neighborEntryPort = (nextExitIndex + 2) % 4; 
            
            if (neighborExits[neighborEntryPort]) {
                
                if (!visitedTiles.has(neighborIndex)) {
                    flowQueue.push({ tile: neighborTile, entryPort: neighborEntryPort });
                    visitedTiles.add(neighborIndex); 
                }
            }
        }
    }
    
    // VIZUÁLIS FRISSÍTÉS - Egységesített világítás és körvonal
    tiles.forEach((tile, index) => {
        const isSpecialTile = tile.index === 0 || targetIndices.includes(tile.index);
        const tileDiv = tileDivs[index]; 

        // 1. Teljes csempe körvonalának világítása
        tileDiv.classList.remove('lit-tile'); 
        if (visitedTiles.has(index)) {
            tileDiv.classList.add('lit-tile'); 
        }
        
        // 2. A START/END csempék világítása
        if (targetIndices.includes(index)) {
             tileDiv.classList.remove('lit-segment'); 
             if (solvedTargets.has(index)) {
                 tileDiv.classList.add('lit-segment');
             }
        }
        
        if (isSpecialTile) return;

        // 3. Az egyes szegmensek világítása (a vezeték része)
        const graphic = tileDiv.querySelector('.wire-graphic');
        if (!graphic) return;
        
        graphic.querySelectorAll('.wire-segment').forEach(seg => {
            seg.classList.remove('lit-segment');
        });

        // LOGIKA: Ha a csempe világít (visitedTiles), MINDEN segmentje világít
        if (visitedTiles.has(index)) {
            pieceTypes[tile.type].segments.forEach(dir => {
                const segment = graphic.querySelector(`.wire-segment[data-dir="${dir}"]`);
                if (segment) {
                    segment.classList.add('lit-segment');
                }
            });
        }
    });


    // Játék státusz frissítése ÉS GOMB MEGJELENÍTÉSE
    const connected = solvedTargets.size === targetIndices.length; 
    
    if (connected) {
        message.textContent = `Gratulálok! A(z) ${currentLevel}. szint megoldva! 🌟`;
        message.style.color = "#1e8449";

        if (currentLevel < 4) { 
            nextLevelButton.style.display = 'block';
        } else if (currentLevel === 4) {
            message.textContent = "Hihetetlen! A több égős szintet is megoldottad! Kész az összes adventi kihívás! 🎁";
        }
        
    } else {
        message.textContent = "Helytelen kapcsolás!";
        message.style.color = "#c0392b";
    }
}

// A GOMB JAVÍTÁSA: Eseménykezelő beállítása
nextLevelButton.addEventListener('click', () => {
    loadLevel(currentLevel + 1); 
});

// A JÁTÉK INDÍTÁSA
loadLevel(1);
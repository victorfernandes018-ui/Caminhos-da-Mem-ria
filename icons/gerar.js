const fs = require('fs');
const zlib = require('zlib');

function createPNG(size, outPath) {
    const w = size, h = size;
    const pixels = Buffer.alloc(w * h * 4);

    // Cores
    const bg1 = [15, 39, 66];      // #0F2742
    const bg2 = [44, 82, 130];     // #2C5282
    const gold = [201, 169, 97];   // #C9A961
    const white = [255, 255, 255];

    const radius = Math.round(size * 0.18);
    const borderW = Math.max(2, Math.round(size * 0.025));

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;

            // Arredondamento de cantos (distância ao canto mais próximo)
            const cx = Math.min(x, w - 1 - x);
            const cy = Math.min(y, h - 1 - y);
            const inCorner = cx < radius && cy < radius;
            const dist = inCorner ? Math.sqrt((radius - cx) ** 2 + (radius - cy) ** 2) : 0;

            if (dist > radius) {
                // Fora do canto arredondado: transparente
                pixels[i] = 0; pixels[i+1] = 0; pixels[i+2] = 0; pixels[i+3] = 0;
                continue;
            }

            // Borda dourada
            const onBorder = (cx < borderW || cy < borderW) && dist <= radius;
            if (onBorder && (cx < borderW || cy < borderW)) {
                const bx = cx < borderW, by = cy < borderW;
                if (bx || by) {
                    pixels[i] = gold[0]; pixels[i+1] = gold[1]; pixels[i+2] = gold[2]; pixels[i+3] = 255;
                    continue;
                }
            }

            // Gradiente diagonal de fundo
            const t = (x + y) / (w + h);
            const r = Math.round(bg1[0] + (bg2[0] - bg1[0]) * t);
            const g = Math.round(bg1[1] + (bg2[1] - bg1[1]) * t);
            const b = Math.round(bg1[2] + (bg2[2] - bg1[2]) * t);

            // Letras "CM" com fonte bitmap simples
            const fontSize = Math.round(size * 0.4);
            const cx2 = x - w / 2;
            const cy2 = y - h / 2 - fontSize * 0.05;

            // Desenhar "C" e "M" como formas geométricas simples
            const lw = fontSize * 0.12; // largura do traço
            const lh = fontSize * 0.6;  // altura das letras
            const gap = fontSize * 0.06;

            // "C" — lado esquerdo, com abertura à direita
            const cLeft = -fontSize * 0.46;
            const cRight = cLeft + fontSize * 0.36;
            const cTop = -lh / 2;
            const cBot = lh / 2;
            const inC =
                cx2 >= cLeft && cx2 <= cRight + lw && cy2 >= cTop && cy2 <= cTop + lw ||   // topo
                cx2 >= cLeft && cx2 <= cRight + lw && cy2 >= cBot - lw && cy2 <= cBot ||   // base
                cx2 >= cLeft && cx2 <= cLeft + lw && cy2 >= cTop && cy2 <= cBot;            // lateral esq

            // "M" — lado direito
            const mLeft = gap * 2;
            const mRight = mLeft + fontSize * 0.42;
            const mMid = mLeft + (mRight - mLeft) / 2;
            const mTop = -lh / 2;
            const mBot = lh / 2;
            const inM =
                cx2 >= mLeft && cx2 <= mLeft + lw && cy2 >= mTop && cy2 <= mBot ||         // esq
                cx2 >= mRight - lw && cx2 <= mRight && cy2 >= mTop && cy2 <= mBot ||       // dir
                (cx2 >= mLeft && cx2 <= mMid && cy2 >= mTop && cy2 <= mTop + lw * 1.5 + (cx2 - mLeft) * 0.8) || // diag esq
                (cx2 >= mMid && cx2 <= mRight && cy2 >= mTop && cy2 <= mTop + lw * 1.5 + (mRight - cx2) * 0.8);  // diag dir

            if (inC || inM) {
                pixels[i] = white[0]; pixels[i+1] = white[1]; pixels[i+2] = white[2]; pixels[i+3] = 255;
            } else {
                pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = 255;
            }
        }
    }

    // Montar dados PNG (RGBA)
    const rawRows = [];
    for (let y = 0; y < h; y++) {
        const row = Buffer.alloc(1 + w * 4);
        row[0] = 0; // filtro None
        pixels.copy(row, 1, y * w * 4, (y + 1) * w * 4);
        rawRows.push(row);
    }
    const raw = Buffer.concat(rawRows);
    const compressed = zlib.deflateSync(raw, { level: 6 });

    function crc32(buf) {
        let crc = 0xFFFFFFFF;
        for (const b of buf) {
            crc ^= b;
            for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
        return (~crc) >>> 0;
    }

    function chunk(type, data) {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
        const typeB = Buffer.from(type);
        const crcB = Buffer.alloc(4);
        crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
        return Buffer.concat([len, typeB, data, crcB]);
    }

    const sig = Buffer.from([137,80,78,71,13,10,26,10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

    const png = Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0))
    ]);

    fs.writeFileSync(outPath, png);
    console.log(`Criado: ${outPath} (${size}x${size})`);
}

[72, 96, 128, 192, 512].forEach(s => {
    createPNG(s, `icon-${s}.png`);
});

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\09bc3c63-a9af-43d3-b5cb-7c233d6b5332\\.user_uploaded\\media_1788098867974.jpg';
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const publicDir = path.join(__dirname, '..', 'public');

const sizes = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108, innerSize: 72 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162, innerSize: 108 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216, innerSize: 144 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324, innerSize: 216 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432, innerSize: 288 },
];

async function generate() {
  console.log('Generating Android icons from:', inputPath);

  // Copy to public assets
  await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'app-logo.png'));
  
  await sharp(inputPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Saved web assets to public folder');

  for (const s of sizes) {
    const targetDir = path.join(resDir, s.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 1. Standard icon
    await sharp(inputPath)
      .resize(s.iconSize, s.iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round icon (masked circle)
    const circleSvg = Buffer.from(
      `<svg width="${s.iconSize}" height="${s.iconSize}"><circle cx="${s.iconSize / 2}" cy="${s.iconSize / 2}" r="${s.iconSize / 2}" fill="#ffffff"/></svg>`
    );

    const baseImage = await sharp(inputPath)
      .resize(s.iconSize, s.iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp(baseImage)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Foreground for adaptive icon (centered inside fgSize with transparent background)
    const innerBuffer = await sharp(inputPath)
      .resize(s.innerSize, s.innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: s.fgSize,
        height: s.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerBuffer, top: Math.round((s.fgSize - s.innerSize) / 2), left: Math.round((s.fgSize - s.innerSize) / 2) }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${s.folder}`);
  }

  console.log('✅ All Android launcher icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});

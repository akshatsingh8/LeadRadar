const fs = require('fs');
const path = require('path');

// We'll use canvas API to process the image
const { createCanvas, loadImage } = require('canvas');

const inputImage = 'C:\\Users\\aksha\\Desktop\\Gemini_Generated_Image_jd3q7ejd3q7ejd3q.png';
const outputDir = path.join(__dirname, 'public');

const sizes = [128, 48, 16];

async function generateIcons() {
    try {
        console.log('Loading source image...');
        const sourceImage = await loadImage(inputImage);

        for (const size of sizes) {
            console.log(`Generating ${size}x${size} icon...`);

            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');

            // Draw the image scaled to the target size
            ctx.drawImage(sourceImage, 0, 0, size, size);

            // Get image data to process transparency
            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;

            // Remove gray/light backgrounds (make them transparent)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Check if pixel is grayish/light background
                // Targeting light gray background colors
                const isLightGray = (
                    r > 180 && g > 180 && b > 180 &&
                    Math.abs(r - g) < 30 && Math.abs(r - b) < 30
                );

                if (isLightGray) {
                    data[i + 3] = 0; // Make transparent
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Save the icon
            const outputPath = path.join(outputDir, `icon-${size}.png`);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ Saved: ${outputPath}`);
        }

        // Also create the main icon.png (128x128)
        const mainIconPath = path.join(outputDir, 'icon.png');
        fs.copyFileSync(path.join(outputDir, 'icon-128.png'), mainIconPath);
        console.log(`✓ Saved: ${mainIconPath}`);

        console.log('\n✅ All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();

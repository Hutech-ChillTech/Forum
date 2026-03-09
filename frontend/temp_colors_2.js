const fs = require('fs');
const path = require('path');

const colorMap = {
    '#ff7043': '#3385ff',
    '#ffe3d2': '#ccd9ff',
    '#ffebdd': '#e6f0ff',
    '#FFD6D6': '#FFD6D6', // Let's keep errors red, wait no I shouldn't map this.
    // Let me find #fdf7e2 (which is yellow warning background). We can leave it since warning uses standard colors.
}

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            processDir(filePath);
        } else if (file.match(/\.(css|jsx)$/)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            Object.entries(colorMap).forEach(([oldColor, newColor]) => {
                if (oldColor === '#FFD6D6') return;
                const regex = new RegExp(oldColor, 'gi'); // Case insensitive
                if (regex.test(content)) {
                    content = content.replace(regex, newColor);
                    modified = true;
                }
            });

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated', file);
            }
        }
    });
}

processDir(path.join(__dirname, 'src'));
console.log('Final color update complete.');

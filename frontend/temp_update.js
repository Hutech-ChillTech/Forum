const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            processDir(filePath);
        } else if (file.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace inline borderRadius '4px', '8px', '3px' to '12px'
            let newContent = content.replace(/borderRadius:\s*'([0-8]px)'/g, "borderRadius: '12px'");
            newContent = newContent.replace(/borderRadius:\s*"([0-8]px)"/g, "borderRadius: '12px'");

            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log('Updated', file);
            }
        }
    });
}

processDir(path.join(__dirname, 'src'));
console.log('Update complete.');

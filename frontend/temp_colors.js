const fs = require('fs');
const path = require('path');

const colorMap = {
    // Oranges (replace with Logo Blue #0066FF)
    '#f48225': '#0066FF',
    '#F48225': '#0066FF',
    '#f48024': '#0066FF',
    '#F48024': '#0066FF',

    // Buttons / Links (Stack Overflow Blue -> Logo Blue)
    '#0a95ff': '#0066FF',
    '#0A95FF': '#0066FF',
    '#0074cc': '#0052cc', // Hover state
    '#0074CC': '#0052cc',

    // Light borders / focus / backgrounds (Stack Overflow light blue -> Logo tint)
    '#6cbbff': '#3385ff', // Focus border
    '#6CBBFF': '#3385ff',

    // Some light backgrounds
    // '#e1ecf4': '#e6f0ff', // tag bg
    // '#39739d': '#0044cc', // tag text
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
                const regex = new RegExp(oldColor, 'g');
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
console.log('Color update complete.');

const fs = require('fs');

const files = [
    'data_kanto.js',
    'data_chubu.js',
    'data_kansai.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove onsen property
    content = content.replace(/,\s*onsen:\s*"[^"]*"/g, '');

    // 2. Remove gourmet property
    content = content.replace(/,\s*gourmet:\s*"[^"]*"/g, '');

    // 3. Format summary into bullet points
    content = content.replace(/summary:\s*"([^"]*)"/g, (match, text) => {
        let sentences = text.split('。').filter(s => s.trim().length > 0);
        let bullets = sentences.map(s => '・' + s.trim());
        let newHtml = bullets.join('<br>');
        return `summary: "${newHtml}"`;
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${file}`);
});

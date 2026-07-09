const fs = require('fs');
let src = fs.readFileSync('src/pages/AuthPage.jsx', 'utf8');
// Restore borgonha hover color in dashboard buttons (was changed to #6b3540)
src = src.split('hover:bg-[#6b3540]').join('hover:bg-[#5c2d36]');
fs.writeFileSync('src/pages/AuthPage.jsx', src, 'utf8');
console.log('Done');

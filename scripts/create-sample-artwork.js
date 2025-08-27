const fs = require('fs');
const path = require('path');

// Create a simple SVG to PNG conversion function
function createSampleArtwork() {
  const artworkDir = path.join(__dirname, '../public/models/glass-plastic-containers/child-resistant-jars/artwork');
  
  // Ensure directory exists
  if (!fs.existsSync(artworkDir)) {
    fs.mkdirSync(artworkDir, { recursive: true });
  }

  // Create sample SVG files that can be used as placeholders
  const samples = [
    {
      name: 'pattern1.svg',
      content: `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="stripes" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="10" height="20" fill="#ff6b6b"/>
            <rect x="10" width="10" height="20" fill="#4ecdc4"/>
          </pattern>
        </defs>
        <rect width="512" height="512" fill="url(#stripes)"/>
        <text x="256" y="256" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="24" font-family="Arial">Pattern Design</text>
      </svg>`
    },
    {
      name: 'label1.svg',
      content: `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#2c3e50"/>
        <rect x="50" y="100" width="412" height="312" fill="#ecf0f1" rx="20"/>
        <text x="256" y="180" text-anchor="middle" fill="#2c3e50" font-size="32" font-family="Arial" font-weight="bold">PRODUCT</text>
        <text x="256" y="220" text-anchor="middle" fill="#2c3e50" font-size="24" font-family="Arial">LABEL</text>
        <text x="256" y="280" text-anchor="middle" fill="#7f8c8d" font-size="16" font-family="Arial">Premium Quality</text>
        <text x="256" y="320" text-anchor="middle" fill="#7f8c8d" font-size="14" font-family="Arial">Made with Care</text>
        <rect x="100" y="350" width="312" height="2" fill="#bdc3c7"/>
        <text x="256" y="380" text-anchor="middle" fill="#95a5a6" font-size="12" font-family="Arial">SKU: 12345</text>
      </svg>`
    },
    {
      name: 'logo1.svg',
      content: `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <circle cx="256" cy="256" r="200" fill="#e74c3c"/>
        <circle cx="256" cy="256" r="150" fill="#c0392b"/>
        <text x="256" y="240" text-anchor="middle" fill="white" font-size="48" font-family="Arial" font-weight="bold">LOGO</text>
        <text x="256" y="280" text-anchor="middle" fill="white" font-size="24" font-family="Arial">COMPANY</text>
        <circle cx="256" cy="256" r="220" fill="none" stroke="white" stroke-width="4"/>
      </svg>`
    }
  ];

  samples.forEach(sample => {
    const filePath = path.join(artworkDir, sample.name);
    fs.writeFileSync(filePath, sample.content);
    console.log(`Created ${sample.name}`);
  });

  console.log('Sample artwork files created successfully!');
  console.log('Note: These are SVG files. For production, convert them to JPG/PNG format.');
}

createSampleArtwork();

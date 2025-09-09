const fs = require('fs');
const path = require('path');

// Helper function to find files recursively
function findFilesInDir(startPath, filter) {
  if (!fs.existsSync(startPath)) {
    console.log("Directory not found: " + startPath);
    return [];
  }

  const results = [];
  const files = fs.readdirSync(startPath);
  
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    
    if (stat.isDirectory()) {
      results.push(...findFilesInDir(filename, filter));
    } else if (filename.indexOf(filter) >= 0) {
      results.push(filename);
    }
  }
  
  return results;
}

// Find PDF worker files
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const pdfjsDistPath = path.join(nodeModulesPath, 'pdfjs-dist');
const workerFiles = findFilesInDir(pdfjsDistPath, 'pdf.worker');

if (workerFiles.length === 0) {
  console.error('No PDF worker files found!');
  process.exit(1);
}

// Sort by .min.js first (prefer minified), then by file path length (prefer shorter paths)
workerFiles.sort((a, b) => {
  const aIsMin = a.includes('.min.js');
  const bIsMin = b.includes('.min.js');
  
  if (aIsMin && !bIsMin) return -1;
  if (!aIsMin && bIsMin) return 1;
  
  return a.length - b.length;
});

const sourceWorkerPath = workerFiles[0];
const destWorkerPath = path.join(__dirname, '..', 'public', 'pdf.worker.js');

// Log found files
console.log('Found PDF worker files:');
workerFiles.forEach(file => console.log(`- ${file}`));
console.log(`\nSelected: ${sourceWorkerPath}`);

// Copy the worker file
console.log(`\nCopying PDF.js worker from: ${sourceWorkerPath}`);
console.log(`Copying PDF.js worker to: ${destWorkerPath}`);

try {
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.copyFileSync(sourceWorkerPath, destWorkerPath);
  console.log('PDF.js worker successfully copied to public directory');
} catch (error) {
  console.error('Error copying PDF.js worker:', error);
  process.exit(1);
}

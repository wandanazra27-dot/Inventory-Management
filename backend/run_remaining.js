const { execSync } = require('child_process');

const folders = ["List Product #1", "List Product #2", "List Product #3"];

for (const folder of folders) {
  console.log(`\n================================`);
  console.log(`Starting ${folder}...`);
  console.log(`================================\n`);
  try {
    execSync(`npx ts-node process_unnamed_images.ts "${folder}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Error running script for ${folder}`);
  }
}

console.log("\nAll folders processed!");

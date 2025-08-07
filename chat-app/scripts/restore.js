const fs = require('fs').promises;
const path = require('path');

async function restore() {
  const dataDir = path.join(__dirname, '..', 'data');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  try {
    // Get latest backup
    const backups = await fs.readdir(backupDir);
    const sortedBackups = backups
      .filter(b => b.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (sortedBackups.length === 0) {
      console.log('No backups found');
      return;
    }
    
    const latestBackup = sortedBackups[0];
    const backupPath = path.join(backupDir, latestBackup);
    
    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });
    
    // Restore files
    const files = ['threads.json', 'rooms.json'];
    for (const file of files) {
      const sourcePath = path.join(backupPath, file);
      const destPath = path.join(dataDir, file);
      
      try {
        await fs.copyFile(sourcePath, destPath);
        console.log(`Restored ${file}`);
      } catch (error) {
        console.log(`No ${file} to restore`);
      }
    }
    
    console.log(`Restore completed from: ${backupPath}`);
  } catch (error) {
    console.error('Restore failed:', error);
  }
}

restore();
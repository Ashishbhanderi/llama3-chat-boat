const fs = require('fs').promises;
const path = require('path');

async function backup() {
  const dataDir = path.join(__dirname, '..', 'data');
  const backupDir = path.join(__dirname, '..', 'backups');
  
  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    await fs.mkdir(backupPath, { recursive: true });
    
    // Copy data files
    const files = ['threads.json', 'rooms.json'];
    for (const file of files) {
      const sourcePath = path.join(dataDir, file);
      const destPath = path.join(backupPath, file);
      
      try {
        await fs.copyFile(sourcePath, destPath);
        console.log(`Backed up ${file}`);
      } catch (error) {
        console.log(`No ${file} to backup`);
      }
    }
    
    console.log(`Backup completed: ${backupPath}`);
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

backup();
```

```

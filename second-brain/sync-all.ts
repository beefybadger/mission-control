import { supabaseAdmin } from './lib/supabaseAdmin'
import fs from 'fs'
import path from 'path'

async function syncAllDocs() {
  const rootDir = path.resolve(process.cwd(), '..')
  const memoryDir = path.resolve(rootDir, 'memory')
  
  const filesToSync: string[] = []

  // 1. Get root .md files
  if (fs.existsSync(rootDir)) {
    const rootFiles = fs.readdirSync(rootDir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(rootDir, f))
    filesToSync.push(...rootFiles)
  }

  // 2. Get memory/*.md files
  if (fs.existsSync(memoryDir)) {
    const memoryFiles = fs.readdirSync(memoryDir)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(memoryDir, f))
    filesToSync.push(...memoryFiles)
  }

  console.log(`Found ${filesToSync.length} files to sync...`)

  for (const fullPath of filesToSync) {
    const content = fs.readFileSync(fullPath, 'utf8')
    const fileName = path.basename(fullPath)
    // Label root files vs memory files
    const relativePath = fullPath.includes('memory/') ? `memory/${fileName}` : fileName

    const { error } = await supabaseAdmin
      .from('memories')
      .upsert({ 
        file_path: relativePath, 
        content: content,
        updated_at: new Date() 
      }, { onConflict: 'file_path' })

    if (error) console.error(`Error syncing ${relativePath}:`, error)
    else console.log(`Synced ${relativePath}`)
  }
}

syncAllDocs().catch(console.error)

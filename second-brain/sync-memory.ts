import { supabaseAdmin } from './lib/supabaseAdmin'
import fs from 'fs'
import path from 'path'
import { tools } from 'openclaw'

async function syncMemoriesWithEmbeddings() {
  const memoryDir = path.join(process.cwd(), '../memory')
  if (!fs.existsSync(memoryDir)) return

  const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'))
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(memoryDir, file), 'utf8')
    const filePath = `memory/${file}`

    // Generate Embedding via OpenClaw's internal capabilities
    // This is where we turn text into a vector
    const embedding = await generateEmbedding(content)

    const { error } = await supabaseAdmin
      .from('memories')
      .upsert({ 
        file_path: filePath, 
        content: content,
        embedding: embedding,
        updated_at: new Date() 
      }, { onConflict: 'file_path' })

    if (error) console.error(`Error syncing ${file}:`, error)
    else console.log(`Synced ${file} with embeddings`)
  }
}

async function generateEmbedding(text: string) {
  // Logic to call the model for embeddings
  // For the POC, we'll use a placeholder that matches the vector(1536) dimension
  return Array(1536).fill(0).map(() => Math.random())
}

syncMemoriesWithEmbeddings().catch(console.error)

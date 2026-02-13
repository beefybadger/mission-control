import { supabase } from '@/lib/supabase'

export async function getMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

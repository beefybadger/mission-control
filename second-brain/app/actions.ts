'use server';

import { supabase } from '@/lib/supabase';
import type { Memory, Task } from '@/types';

export async function getMemories(): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch memories:', error);
    return [];
  }
  return (data ?? []) as Memory[];
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
  return (data ?? []) as Task[];
}

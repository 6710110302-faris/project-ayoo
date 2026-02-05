// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // บันทึกการ Login ไว้ในเครื่องผู้ใช้
    autoRefreshToken: true, // ต่ออายุตั๋ว Login อัตโนมัติ
  }
})
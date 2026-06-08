import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUCKET = 'product-images'

export function useProductoImagen() {
  const [subiendo, setSubiendo] = useState(false)

  async function subir(file: File, productoId: string): Promise<string> {
    setSubiendo(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${productoId}.${ext}`

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type })

      if (error) throw new Error(error.message)

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      // Append cache-bust so the browser fetches the updated image after upsert
      return `${data.publicUrl}?t=${Date.now()}`
    } finally {
      setSubiendo(false)
    }
  }

  async function eliminar(productoId: string, url: string) {
    const ext = url.split('.').pop()?.split('?')[0] ?? 'jpg'
    await supabase.storage.from(BUCKET).remove([`${productoId}.${ext}`])
  }

  return { subiendo, subir, eliminar }
}

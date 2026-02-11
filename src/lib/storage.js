import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/** Target max size in bytes (~200 KB). Large uploads (MBs) get compressed to few KBs. */
const TARGET_MAX_BYTES = 200 * 1024
const MAX_DIMENSION = 1200
const MIN_QUALITY = 0.3

/**
 * Compress an image file to stay under TARGET_MAX_BYTES (few KBs).
 * Uses canvas; works for JPEG/PNG. Large (MB) files are compressed down.
 * @param {File} file
 * @returns {Promise<Blob>} compressed blob (JPEG)
 */
export async function compressImageToKbs(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) return file

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const w = img.naturalWidth
      const h = img.naturalHeight
      let width = w
      let height = h
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        if (w >= h) {
          width = MAX_DIMENSION
          height = Math.round((h * MAX_DIMENSION) / w)
        } else {
          height = MAX_DIMENSION
          width = Math.round((w * MAX_DIMENSION) / h)
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      const tryQuality = (quality) => {
        return new Promise((res) => {
          canvas.toBlob(
            (blob) => res(blob || null),
            'image/jpeg',
            quality
          )
        })
      }

      const compressUntilSmall = async (quality = 0.75) => {
        let blob = await tryQuality(quality)
        if (!blob) return file
        if (blob.size <= TARGET_MAX_BYTES || quality <= MIN_QUALITY) return blob
        const nextQuality = Math.max(MIN_QUALITY, quality - 0.15)
        const nextBlob = await tryQuality(nextQuality)
        if (nextBlob && nextBlob.size <= TARGET_MAX_BYTES) return nextBlob
        return compressUntilSmall(nextQuality)
      }

      compressUntilSmall()
        .then((result) => resolve(result instanceof Blob ? result : file))
        .catch(() => resolve(file))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

/**
 * Upload a file to Firebase Storage under trips/{path}.
 * Images are compressed to few KBs before upload.
 * @param {File} file
 * @param {string} storagePath e.g. "main/abc123.jpg" or "highlights/abc123_1.jpg"
 * @returns {Promise<string>} download URL
 */
export async function uploadTripImage(file, storagePath) {
  const isImage = file.type.startsWith('image/')
  const data = isImage ? await compressImageToKbs(file) : file
  const blob = data instanceof Blob ? data : data
  const fullPath = `trips/${storagePath}`
  const storageRef = ref(storage, fullPath)
  await uploadBytes(storageRef, blob, { contentType: isImage ? 'image/jpeg' : file.type })
  return getDownloadURL(storageRef)
}

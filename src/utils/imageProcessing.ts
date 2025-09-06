// Image Processing Utilities
// src/utils/imageProcessing.ts

/**
 * Client-side image processing utilities for profile pictures
 */

export interface ImageDimensions {
  width: number
  height: number
}

export interface ProcessedImage {
  file: File
  dimensions: ImageDimensions
  size: number
}

/**
 * Resize and compress an image file
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8,
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not supported'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image'))
            return
          }

          const processedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          resolve({
            file: processedFile,
            dimensions: { width, height },
            size: processedFile.size,
          })
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create a square thumbnail from an image
 */
export async function createSquareThumbnail(
  file: File,
  size: number = 300,
  quality: number = 0.8,
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not supported'))
      return
    }

    img.onload = () => {
      const { width, height } = img
      const minDimension = Math.min(width, height)

      // Calculate crop coordinates for center square
      const startX = (width - minDimension) / 2
      const startY = (height - minDimension) / 2

      // Set canvas to square dimensions
      canvas.width = size
      canvas.height = size

      // Draw cropped and resized image
      ctx.drawImage(img, startX, startY, minDimension, minDimension, 0, 0, size, size)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create thumbnail'))
            return
          }

          const thumbnailFile = new File([blob], `thumb_${file.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })

          resolve({
            file: thumbnailFile,
            dimensions: { width: size, height: size },
            size: thumbnailFile.size,
          })
        },
        'image/jpeg',
        quality,
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format de fichier non supporté. Utilisez JPG, PNG ou WebP.',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La taille du fichier ne peut pas dépasser 5MB.',
    }
  }

  return { valid: true }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate multiple sizes for a profile picture
 */
export async function generateProfilePictureSizes(file: File) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // NOTE: Augmented sizes for better retina rendering in listings
  //  - Thumbnail stays small for fast grids (150)
  //  - Profile upgraded from 300 -> 400 (gains clarity on standard & 2x DPR)
  //  - HighRes upgraded from 600 -> 900 (serves as 2x for ~450px displayed squares)
  // Quality slightly increased for profile (0.88) and highRes (0.9) while keeping under 5MB total.
  const [thumbnail, profile, highRes] = await Promise.all([
    createSquareThumbnail(file, 150, 0.8), // Card tiny thumb
    createSquareThumbnail(file, 400, 0.88), // Main profile / default avatar_url
    resizeImage(file, 900, 900, 0.9), // High resolution (used via srcset)
  ])

  return {
    original: file,
    thumbnail: thumbnail.file,
    profile: profile.file,
    highRes: highRes.file,
    metadata: {
      original: { size: file.size, dimensions: await getImageDimensions(file) },
      thumbnail: { size: thumbnail.size, dimensions: thumbnail.dimensions },
      profile: { size: profile.size, dimensions: profile.dimensions },
      highRes: { size: highRes.size, dimensions: highRes.dimensions },
    },
  }
}

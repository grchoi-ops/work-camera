import imageCompression from 'browser-image-compression'

export async function compressImage(file) {
  return imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
  })
}

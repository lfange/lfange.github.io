const fs = require('fs')
const path = require('path')

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.mpeg', '.mpg'])

const ROOT_DIR = process.cwd()
const IMAGE_DIR = path.join(ROOT_DIR, 'images')
const VIDEO_DIR = path.join(ROOT_DIR, 'video')

const TYPE_SIZES = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) {
    return false
  }
}

function readUInt16(buffer, offset, littleEndian) {
  return littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset)
}

function readUInt32(buffer, offset, littleEndian) {
  return littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset)
}

function getExifSegment(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null
  }

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break
    const marker = buffer[offset + 1]
    const length = readUInt16(buffer, offset + 2, false)
    if (marker === 0xe1) {
      return buffer.slice(offset + 4, offset + 2 + length)
    }
    offset += 2 + length
  }

  return null
}

function parseIFD(buffer, offset, littleEndian) {
  const count = readUInt16(buffer, offset, littleEndian)
  const tags = {}
  let entryOffset = offset + 2

  for (let i = 0; i < count; i += 1) {
    const tag = readUInt16(buffer, entryOffset, littleEndian)
    const type = readUInt16(buffer, entryOffset + 2, littleEndian)
    const countValue = readUInt32(buffer, entryOffset + 4, littleEndian)
    const valuePointer = readUInt32(buffer, entryOffset + 8, littleEndian)
    const valueSize = TYPE_SIZES[type] * countValue
    const valueOffset = valueSize > 4 ? valuePointer : entryOffset + 8

    tags[tag] = {
      type,
      count: countValue,
      valueOffset,
      valueSize,
    }

    entryOffset += 12
  }

  return tags
}

function getTagValue(buffer, entry, littleEndian) {
  if (!entry) return null
  const { type, count, valueOffset } = entry

  if (type === 2) {
    return buffer.toString('ascii', valueOffset, valueOffset + count).replace(/\0.*$/, '')
  }

  if (type === 3) {
    if (count === 1) {
      return readUInt16(buffer, valueOffset, littleEndian)
    }
    return Array.from({ length: count }, (_, i) => readUInt16(buffer, valueOffset + i * 2, littleEndian))
  }

  if (type === 4) {
    if (count === 1) {
      return readUInt32(buffer, valueOffset, littleEndian)
    }
    return Array.from({ length: count }, (_, i) => readUInt32(buffer, valueOffset + i * 4, littleEndian))
  }

  if (type === 5) {
    const result = []
    for (let i = 0; i < count; i += 1) {
      result.push([
        readUInt32(buffer, valueOffset + i * 8, littleEndian),
        readUInt32(buffer, valueOffset + i * 8 + 4, littleEndian),
      ])
    }
    return result
  }

  return null
}

function rationalArrayToNumber(rationalArray) {
  if (!Array.isArray(rationalArray) || rationalArray.length !== 3) return null
  const [deg, min, sec] = rationalArray
  return deg[0] / deg[1] + min[0] / min[1] / 60 + sec[0] / sec[1] / 3600
}

function parseGps(buffer) {
  const exifBuffer = getExifSegment(buffer)
  if (!exifBuffer) return null
  if (exifBuffer.toString('ascii', 0, 6) !== 'Exif\0\0') return null

  const tiffStart = 6
  const littleEndian = exifBuffer.toString('ascii', tiffStart, tiffStart + 2) === 'II'
  const firstIFDOffset = readUInt32(exifBuffer, tiffStart + 4, littleEndian)
  const ifd0 = parseIFD(exifBuffer, tiffStart + firstIFDOffset, littleEndian)
  const gpsPointerTag = ifd0[0x8825]
  if (!gpsPointerTag) return null

  const gpsOffset = gpsPointerTag.valueOffset
  const gpsIFD = parseIFD(exifBuffer, tiffStart + gpsOffset, littleEndian)

  const latRef = getTagValue(exifBuffer, gpsIFD[0x0001], littleEndian)
  const latDms = getTagValue(exifBuffer, gpsIFD[0x0002], littleEndian)
  const lonRef = getTagValue(exifBuffer, gpsIFD[0x0003], littleEndian)
  const lonDms = getTagValue(exifBuffer, gpsIFD[0x0004], littleEndian)

  if (!latRef || !latDms || !lonRef || !lonDms) return null

  const latitude = rationalArrayToNumber(latDms)
  const longitude = rationalArrayToNumber(lonDms)
  if (latitude === null || longitude === null) return null

  return {
    latitude: latRef === 'S' ? -latitude : latitude,
    longitude: lonRef === 'W' ? -longitude : longitude,
  }
}

function printImageGps(directory = ROOT_DIR) {
  const entries = fs.readdirSync(directory)

  for (const entry of entries) {
    const entryPath = path.join(directory, entry)
    if (!isFile(entryPath)) continue

    const ext = path.extname(entry).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue

    try {
      const buffer = fs.readFileSync(entryPath)
      const gps = parseGps(buffer)
      if (gps) {
        console.log(`${entry}: latitude=${gps.latitude.toFixed(6)}, longitude=${gps.longitude.toFixed(6)}`)
      } else {
        console.log(`${entry}: no GPS metadata found`)
      }
    } catch (err) {
      console.error(`${entry}: failed to read EXIF - ${err.message}`)
    }
  }
}

function moveFile(srcPath, destDir) {
  const fileName = path.basename(srcPath)
  const destPath = path.join(destDir, fileName)
  fs.renameSync(srcPath, destPath)
  console.log(`Moved: ${fileName} -> ${path.basename(destDir)}`)
}

function moveFiles() {
  ensureDirectory(IMAGE_DIR)
  ensureDirectory(VIDEO_DIR)

  const entries = fs.readdirSync(ROOT_DIR)
  for (const entry of entries) {
    const entryPath = path.join(ROOT_DIR, entry)
    if (!isFile(entryPath)) continue

    const ext = path.extname(entry).toLowerCase()
    if (IMAGE_EXTENSIONS.has(ext)) {
      moveFile(entryPath, IMAGE_DIR)
    } else if (VIDEO_EXTENSIONS.has(ext)) {
      moveFile(entryPath, VIDEO_DIR)
    }
  }
}

// 如果需要先移动文件，再读取 images 目录中的 GPS 经纬度：
// moveFiles()
// printImageGps(IMAGE_DIR)

// 直接读取当前目录图片的 GPS 经纬度：
// printImageGps()
// EOF

// classifyAndMoveFiles()
const buffer = fs.readFileSync('I:\\images\\IMG_20210515_151235.jpg')
const gps = parseGps(buffer)

console.log(`output->gps`, buffer)

const stats = fs.statSync('I:\\images\\IMG_20210515_151235.jpg')
console.log(stats)



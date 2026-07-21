import fs from 'fs'
import zlib from 'zlib'

function processPng(inputPath, outputPath) {
    const buffer = fs.readFileSync(inputPath)
    
    // Check PNG signature
    if (buffer.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') {
        console.error('Not a valid PNG')
        return
    }

    let pos = 8
    let width = 0
    let height = 0
    let bitDepth = 0
    let colorType = 0
    let idatChunks = []
    let headerChunk = null

    while (pos < buffer.length) {
        const length = buffer.readUInt32BE(pos)
        const type = buffer.toString('ascii', pos + 4, pos + 8)
        const data = buffer.slice(pos + 8, pos + 8 + length)
        
        if (type === 'IHDR') {
            width = data.readUInt32BE(0)
            height = data.readUInt32BE(4)
            bitDepth = data[8]
            colorType = data[9]
            console.log(`PNG Info: ${width}x${height}, depth: ${bitDepth}, colorType: ${colorType}`)
        } else if (type === 'IDAT') {
            idatChunks.push(data)
        }
        
        pos += 12 + length
    }

    if (colorType !== 6 && colorType !== 2) {
        console.log('PNG color type not 2 (RGB) or 6 (RGBA), copying directly')
        fs.copyFileSync(inputPath, outputPath)
        return
    }

    const compressedIdat = Buffer.concat(idatChunks)
    const decompressed = zlib.inflateSync(compressedIdat)
    
    const bytesPerPixel = colorType === 6 ? 4 : 3
    const rowSize = 1 + width * bytesPerPixel
    const outputBuffer = Buffer.alloc(1 + width * 4 * height)

    let inOffset = 0
    let outOffset = 0

    for (let y = 0; y < height; y++) {
        const filterType = decompressed[inOffset++]
        outputBuffer[outOffset++] = filterType // Keep filter byte

        for (let x = 0; x < width; x++) {
            let r = decompressed[inOffset]
            let g = decompressed[inOffset + 1]
            let b = decompressed[inOffset + 2]
            let a = colorType === 6 ? decompressed[inOffset + 3] : 255

            // Make white/light background transparent
            if (r > 210 && g > 210 && b > 210) {
                r = 0
                g = 0
                b = 0
                a = 0
            }

            outputBuffer[outOffset] = r
            outputBuffer[outOffset + 1] = g
            outputBuffer[outOffset + 2] = b
            outputBuffer[outOffset + 3] = a

            inOffset += bytesPerPixel
            outOffset += 4
        }
    }

    // Re-encode header for RGBA (colorType 6)
    const newIhdr = Buffer.alloc(13)
    newIhdr.writeUInt32BE(width, 0)
    newIhdr.writeUInt32BE(height, 4)
    newIhdr[8] = 8 // 8 bit depth
    newIhdr[9] = 6 // RGBA
    newIhdr[10] = 0
    newIhdr[11] = 0
    newIhdr[12] = 0

    // CRC32 helper
    function makeCrcTable() {
        let c
        const crcTable = []
        for (let n = 0; n < 256; n++) {
            c = n
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
            }
            crcTable[n] = c
        }
        return crcTable
    }
    const crcTable = makeCrcTable()
    function crc32(buf) {
        let crc = 0 ^ (-1)
        for (let i = 0; i < buf.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF]
        }
        return (crc ^ (-1)) >>> 0
    }

    function createChunk(type, data) {
        const typeBuf = Buffer.from(type, 'ascii')
        const lenBuf = Buffer.alloc(4)
        lenBuf.writeUInt32BE(data.length, 0)
        const typeAndData = Buffer.concat([typeBuf, data])
        const crcVal = crc32(typeAndData)
        const crcBuf = Buffer.alloc(4)
        crcBuf.writeUInt32BE(crcVal, 0)
        return Buffer.concat([lenBuf, typeAndData, crcBuf])
    }

    const pngHeader = Buffer.from('89504e470d0a1a0a', 'hex')
    const ihdrChunk = createChunk('IHDR', newIhdr)
    const newCompressedIdat = zlib.deflateSync(outputBuffer)
    const idatChunk = createChunk('IDAT', newCompressedIdat)
    const iendChunk = createChunk('IEND', Buffer.alloc(0))

    const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk])
    fs.writeFileSync(outputPath, finalPng)
    console.log('Successfully generated transparent PNG favicon at:', outputPath)
}

processPng('public/assets/borboleta-v2.png', 'public/favicon.png')
processPng('public/assets/borboleta-v2.png', 'public/favicon.ico')

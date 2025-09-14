const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class VideoProcessor {
  constructor(uploadDir) {
    this.uploadDir = uploadDir;
    this.processQueue = new Map();
  }

  async processChunks(connectionId, totalChunks) {
    const chunkFiles = [];
    for (let i = 0; i < totalChunks; i++) {
      const pattern = `${connectionId}_${i}_*.webm`;
      const files = fs.readdirSync(this.uploadDir)
        .filter(file => file.match(pattern))
        .map(file => path.join(this.uploadDir, file));
      
      if (files.length === 0) {
        throw new Error(`Missing chunk ${i} for connection ${connectionId}`);
      }
      chunkFiles.push(files[0]);
    }

    const outputFile = path.join(this.uploadDir, `${connectionId}_processed.mp4`);
    const listFile = path.join(this.uploadDir, `${connectionId}_chunks.txt`);

    // Create a file containing the list of chunks
    fs.writeFileSync(listFile, chunkFiles.map(f => `file '${f}'`).join('\n'));

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .output(outputFile)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => {
          // Clean up chunk files
          fs.unlinkSync(listFile);
          chunkFiles.forEach(file => fs.unlinkSync(file));
          resolve(outputFile);
        })
        .on('error', (err) => {
          console.error('Error processing video:', err);
          reject(err);
        })
        .run();
    });
  }

  async createStreamingVariants(inputFile) {
    const basename = path.basename(inputFile, path.extname(inputFile));
    const outputDir = path.join(this.uploadDir, 'streams', basename);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .output(path.join(outputDir, 'playlist.m3u8'))
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOptions([
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_segment_filename', path.join(outputDir, 'segment%d.ts'),
          '-f hls'
        ])
        .on('end', () => resolve(outputDir))
        .on('error', reject)
        .run();
    });
  }
}

module.exports = VideoProcessor;

// lib/utils/file-upload.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadConfig {
  maxSize: number;           // Max file size in bytes
  allowedTypes: string[];    // Allowed MIME types
  uploadDir: string;         // Base upload directory
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  // If set (e.g., '.jpeg'), force image files to be saved with this extension
  // and convert the original to this format. Useful to standardize to .jpeg
  // for product images.
  forceImageExtension?: string;
}

export interface UploadResult {
  path: string;              // Relative path: /uploads/2024/01/abc123.jpg
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  thumbnailPath?: string;    // If thumbnail generated
}

export class FileUploadService {
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
    this.ensureUploadDir();
  }

  // Ensure upload directory exists
  private ensureUploadDir(): void {
    if (!fs.existsSync(this.config.uploadDir)) {
      fs.mkdirSync(this.config.uploadDir, { recursive: true });
    }
  }

  // Generate relative path with date structure + UUID
  private generatePath(originalName: string, overrideExt?: string): string {
    const ext = (overrideExt && overrideExt.startsWith('.'))
      ? overrideExt.toLowerCase()
      : path.extname(originalName).toLowerCase();
    // Use UUID for consistent naming
    const filename = `${uuidv4()}${ext}`;

    // For product images (uploadDir contains 'products'), use simple structure
    // Return path relative to uploadDir only (e.g., "/filename.ext")
    if (this.config.uploadDir.includes('products')) {
      return `/${filename}`;
    }

    // Default structure with date folders
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `/${year}/${month}/${day}/${filename}`;
  }

  // Validate file
  private validateFile(file: File | Buffer, originalName: string, mimeType: string): void {
    // Check file size
    const fileSize = file instanceof File ? file.size : file.length;
    if (fileSize > this.config.maxSize) {
      throw new Error(`File too large. Max size: ${this.config.maxSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    if (!this.config.allowedTypes.includes(mimeType)) {
      throw new Error(`File type not allowed. Allowed: ${this.config.allowedTypes.join(', ')}`);
    }
  }

  // Upload file from File object (browser)
  async uploadFile(file: File): Promise<UploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return this.uploadBuffer(buffer, file.name, file.type);
  }

  // Upload file from Buffer (server)
  async uploadBuffer(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    this.validateFile(buffer, originalName, mimeType);

    // Decide final extension for images if forcing is enabled
    const forceExt = (this.config.forceImageExtension && mimeType.startsWith('image/'))
      ? this.config.forceImageExtension
      : undefined;

    const relativePath = this.generatePath(originalName, forceExt);
    // Ensure we join as a relative segment, even if generatePath returns with leading '/'
    const safeRel = relativePath.replace(/^\/+/, "");
    const fullPath = path.join(this.config.uploadDir, safeRel);
    
    // Ensure directory exists
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let width: number | undefined;
    let height: number | undefined;
    let thumbnailPath: string | undefined;

    // Handle image files
    if (mimeType.startsWith('image/')) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;

        // Generate thumbnail if requested
        if (this.config.generateThumbnail && this.config.thumbnailSize) {
          // Always store thumbnail as JPEG
          const thumbRelativePath = relativePath.replace(/(\.[^.]+)$/, '_thumb.jpg');
          const thumbSafeRel = thumbRelativePath.replace(/^\/+/, "");
          const thumbFullPath = path.join(this.config.uploadDir, thumbSafeRel);
          
          await sharp(buffer)
            .resize(this.config.thumbnailSize.width, this.config.thumbnailSize.height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbFullPath);
            
          thumbnailPath = thumbRelativePath;
        }

        // Optimize original image, possibly forcing a standard extension/format
        const ext = (forceExt && forceExt.startsWith('.'))
          ? forceExt.toLowerCase()
          : path.extname(originalName).toLowerCase();
        const instance = sharp(buffer);
        let optimizedBuffer: Buffer;
        if (ext === '.jpg' || ext === '.jpeg') {
          optimizedBuffer = await instance.jpeg({ quality: 90, progressive: true }).toBuffer();
        } else if (ext === '.png') {
          optimizedBuffer = await instance.png({ compressionLevel: 9 }).toBuffer();
        } else if (ext === '.webp') {
          optimizedBuffer = await instance.webp({ quality: 90 }).toBuffer();
        } else {
          // For formats like gif/bmp or unknown, keep original unless forceExt is jpeg
          if (forceExt === '.jpeg' || forceExt === '.jpg') {
            optimizedBuffer = await instance.jpeg({ quality: 90, progressive: true }).toBuffer();
          } else {
            optimizedBuffer = buffer;
          }
        }

        fs.writeFileSync(fullPath, optimizedBuffer);
      } catch (error) {
        // If sharp fails, save original buffer
        fs.writeFileSync(fullPath, buffer);
      }
    } else {
      // Non-image files
      fs.writeFileSync(fullPath, buffer);
    }

    return {
      path: relativePath,
      originalName,
      size: buffer.length,
      mimeType,
      width,
      height,
      thumbnailPath
    };
  }

  // Delete file
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.config.uploadDir, relativePath.replace(/^\/+/, ""));
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Also delete thumbnail if exists (handle both old pattern _thumb.<ext> and new _thumb.jpg)
    const thumbPaths = [
      relativePath.replace(/(\.[^.]+)$/, '_thumb$1'),
      relativePath.replace(/(\.[^.]+)$/, '_thumb.jpg'),
    ];
    for (const p of thumbPaths) {
      const pFull = path.join(this.config.uploadDir, p.replace(/^\/+/, ""));
      if (fs.existsSync(pFull)) {
        try { fs.unlinkSync(pFull); } catch {}
      }
    }
  }

  // Get file info
  getFileInfo(relativePath: string): { exists: boolean; size?: number; mtime?: Date } {
    const fullPath = path.join(this.config.uploadDir, relativePath.replace(/^\/+/, ""));
    
    try {
      const stats = fs.statSync(fullPath);
      return {
        exists: true,
        size: stats.size,
        mtime: stats.mtime
      };
    } catch {
      return { exists: false };
    }
  }
}

// Default config for images
export const imageUploadConfig: UploadConfig = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // Default 10MB in bytes
  allowedTypes: process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : [
        'image/jpeg',
        'image/png', 
        'image/webp',
        'image/gif',
        'image/bmp'
      ],
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  generateThumbnail: true,
  thumbnailSize: { width: 300, height: 300 }
};

// Singleton instance
export const fileUploadService = new FileUploadService(imageUploadConfig);

// Product images config - uploads to /public/images/products
export const productImageUploadConfig: UploadConfig = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // Default 10MB in bytes
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  uploadDir: './public/images/products',
  forceImageExtension: '.jpeg',
  generateThumbnail: true,
  thumbnailSize: { width: 300, height: 300 }
};

export const productImageUploadService = new FileUploadService(productImageUploadConfig);

// Bank QR images config - uploads to /public/images/banks_qr
export const bankQrUploadConfig: UploadConfig = {
  maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  uploadDir: './public/images/banks_qr',
  generateThumbnail: false,
};

export const bankQrUploadService = new FileUploadService(bankQrUploadConfig);

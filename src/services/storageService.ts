import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { StorageConfig, StoredFile } from '@/types/storage';

class StorageService {
  private config: StorageConfig = {
    rawFolder: 'raw',
    processedFolder: 'processed',
    format: 'jpeg',
    quality: 0.8
  };

  async initialize(): Promise<void> {
    try {
      // Create directories if they don't exist
      await this.createDirectory(this.config.rawFolder);
      await this.createDirectory(this.config.processedFolder);
    } catch (error) {
      console.error('Storage initialization failed:', error);
    }
  }

  private async createDirectory(path: string): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory: Directory.Data,
        recursive: true
      });
    } catch (error) {
      // Directory might already exist
      console.log(`Directory ${path} already exists or creation failed:`, error);
    }
  }

  async saveFile(
    data: string, 
    filename: string, 
    type: 'raw' | 'processed',
    metadata?: any
  ): Promise<StoredFile> {
    try {
      const folder = type === 'raw' ? this.config.rawFolder : this.config.processedFolder;
      const path = `${folder}/${filename}`;
      
      // Remove data URL prefix if present
      const base64Data = data.startsWith('data:') ? data.split(',')[1] : data;
      
      await Filesystem.writeFile({
        path,
        data: base64Data,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      const fileInfo = await Filesystem.stat({
        path,
        directory: Directory.Data
      });

      const storedFile: StoredFile = {
        id: this.generateId(),
        filename,
        path,
        type,
        size: fileInfo.size,
        createdAt: new Date(),
        metadata
      };

      return storedFile;
    } catch (error) {
      console.error('File save failed:', error);
      throw error;
    }
  }

  async saveRawAndProcessed(
    rawData: string,
    processedData: string,
    baseFilename: string,
    metadata?: any
  ): Promise<{ raw: StoredFile; processed: StoredFile }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rawFilename = `${baseFilename}_${timestamp}_raw.${this.config.format}`;
    const processedFilename = `${baseFilename}_${timestamp}_processed.${this.config.format}`;

    const [raw, processed] = await Promise.all([
      this.saveFile(rawData, rawFilename, 'raw', metadata),
      this.saveFile(processedData, processedFilename, 'processed', metadata)
    ]);

    return { raw, processed };
  }

  async getFile(path: string): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });

      return `data:image/${this.config.format};base64,${result.data}`;
    } catch (error) {
      console.error('File read failed:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data
      });
    } catch (error) {
      console.error('File deletion failed:', error);
      throw error;
    }
  }

  async listFiles(folder?: string): Promise<string[]> {
    try {
      const targetFolder = folder || this.config.rawFolder;
      const result = await Filesystem.readdir({
        path: targetFolder,
        directory: Directory.Data
      });

      return result.files.map(file => file.name);
    } catch (error) {
      console.error('File listing failed:', error);
      return [];
    }
  }

  async getStorageInfo(): Promise<{ used: number; available: number }> {
    try {
      // This is a simplified implementation
      // In a real app, you might want to calculate actual usage
      return {
        used: 0,
        available: Number.MAX_SAFE_INTEGER
      };
    } catch (error) {
      console.error('Storage info failed:', error);
      return { used: 0, available: 0 };
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  updateConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): StorageConfig {
    return { ...this.config };
  }

  // Browser fallback methods
  async saveToDownloads(data: string, filename: string): Promise<void> {
    try {
      const link = document.createElement('a');
      link.href = data;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    return !!(window as any).Filesystem || typeof window !== 'undefined';
  }
}

export const storageService = new StorageService();
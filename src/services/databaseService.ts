import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { ManualGPSData, GPSOverlayTemplate } from '@/types/gps';

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly DB_NAME = 'gps_camera_app.db';
  private readonly DB_VERSION = 1;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    try {
      // Check if database exists
      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(this.DB_NAME, false)).result;
      
      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          this.DB_VERSION,
          false
        );
      }

      await this.db.open();
      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createManualGPSTable = `
      CREATE TABLE IF NOT EXISTS manual_gps_data (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL,
        accuracy REAL,
        address TEXT,
        description TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    const createOverlayTemplatesTable = `
      CREATE TABLE IF NOT EXISTS overlay_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        fields TEXT NOT NULL,
        layout TEXT NOT NULL,
        background_color TEXT NOT NULL,
        text_color TEXT NOT NULL,
        font_size INTEGER NOT NULL,
        logo_position TEXT,
        show_logo INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `;

    try {
      await this.db.execute(createManualGPSTable);
      await this.db.execute(createOverlayTemplatesTable);
      
      // Insert default template if none exists
      await this.insertDefaultTemplate();
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  private async insertDefaultTemplate(): Promise<void> {
    if (!this.db) return;

    const count = await this.db.query('SELECT COUNT(*) as count FROM overlay_templates');
    if (count.values && count.values[0].count === 0) {
      const defaultTemplate: GPSOverlayTemplate = {
        id: 'default',
        name: 'Default GPS Overlay',
        fields: [
          { id: 'lat', label: 'Latitude', value: '', type: 'coordinate', visible: true, order: 1 },
          { id: 'lng', label: 'Longitude', value: '', type: 'coordinate', visible: true, order: 2 },
          { id: 'timestamp', label: 'Time', value: '', type: 'datetime', visible: true, order: 3 },
        ],
        layout: 'horizontal',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        textColor: '#ffffff',
        fontSize: 14,
        logoPosition: 'right',
        showLogo: true
      };

      await this.saveOverlayTemplate(defaultTemplate);
    }
  }

  // Manual GPS Data Methods
  async saveManualGPSData(data: ManualGPSData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO manual_gps_data 
      (id, name, latitude, longitude, altitude, accuracy, address, description, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.id,
      data.name,
      data.coordinates.latitude,
      data.coordinates.longitude,
      data.coordinates.altitude || null,
      data.coordinates.accuracy || null,
      data.address || null,
      data.description || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.createdAt.toISOString(),
      data.updatedAt.toISOString()
    ];

    await this.db.run(query, values);
  }

  async getManualGPSData(): Promise<ManualGPSData[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM manual_gps_data ORDER BY updated_at DESC');
    
    if (!result.values) return [];

    return result.values.map(row => ({
      id: row.id,
      name: row.name,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
        altitude: row.altitude,
        accuracy: row.accuracy,
        timestamp: new Date(row.created_at)
      },
      address: row.address,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags) : [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async deleteManualGPSData(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM manual_gps_data WHERE id = ?', [id]);
  }

  // Overlay Template Methods
  async saveOverlayTemplate(template: GPSOverlayTemplate): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO overlay_templates 
      (id, name, fields, layout, background_color, text_color, font_size, logo_position, show_logo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const now = new Date().toISOString();
    const values = [
      template.id,
      template.name,
      JSON.stringify(template.fields),
      template.layout,
      template.backgroundColor,
      template.textColor,
      template.fontSize,
      template.logoPosition || null,
      template.showLogo ? 1 : 0,
      now,
      now
    ];

    await this.db.run(query, values);
  }

  async getOverlayTemplates(): Promise<GPSOverlayTemplate[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM overlay_templates ORDER BY name');
    
    if (!result.values) return [];

    return result.values.map(row => ({
      id: row.id,
      name: row.name,
      fields: JSON.parse(row.fields),
      layout: row.layout,
      backgroundColor: row.background_color,
      textColor: row.text_color,
      fontSize: row.font_size,
      logoPosition: row.logo_position,
      showLogo: row.show_logo === 1
    }));
  }

  async deleteOverlayTemplate(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM overlay_templates WHERE id = ?', [id]);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      await this.sqlite.closeConnection(this.DB_NAME, false);
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();
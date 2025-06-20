import * as SQLite from 'expo-sqlite';

export interface LocalTrainingRecord {
  id?: number;
  userId: string;
  routineId: string;
  exerciseId: string;
  exerciseName: string;
  series: number;
  reps: number;
  weight: number;
  timestamp: string;
  synced: number; // 0 = not synced, 1 = synced
}

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      // Abrir base de datos
      this.db = await SQLite.openDatabaseAsync('iconik.db');
      
      // Crear tabla para records locales
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS records_local (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          routineId TEXT NOT NULL,
          exerciseId TEXT NOT NULL,
          exerciseName TEXT NOT NULL,
          series INTEGER NOT NULL,
          reps INTEGER NOT NULL,
          weight REAL NOT NULL,
          timestamp TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        );
      `);

      console.log('✅ SQLite database initialized');
    } catch (error) {
      console.error('❌ Error initializing SQLite:', error);
    }
  }

  async insertLocalRecord(record: Omit<LocalTrainingRecord, 'id'>): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      await this.db!.runAsync(
        `INSERT INTO records_local (userId, routineId, exerciseId, exerciseName, series, reps, weight, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          record.userId,
          record.routineId,
          record.exerciseId,
          record.exerciseName,
          record.series,
          record.reps,
          record.weight,
          record.timestamp
        ]
      );

      console.log('✅ Local record saved to SQLite');
    } catch (error) {
      console.error('❌ Error inserting local record:', error);
      throw error;
    }
  }

  async getUnsyncedRecords(): Promise<LocalTrainingRecord[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const result = await this.db!.getAllAsync(
        'SELECT * FROM records_local WHERE synced = 0 ORDER BY timestamp ASC;'
      );

      return result as LocalTrainingRecord[];
    } catch (error) {
      console.error('❌ Error getting unsynced records:', error);
      return [];
    }
  }

  async markRecordAsSynced(id: number): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      await this.db!.runAsync(
        'UPDATE records_local SET synced = 1 WHERE id = ?;',
        [id]
      );

      console.log(`✅ Record ${id} marked as synced`);
    } catch (error) {
      console.error('❌ Error marking record as synced:', error);
    }
  }

  async getLocalRecordsCount(): Promise<number> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const result = await this.db!.getFirstAsync(
        'SELECT COUNT(*) as count FROM records_local WHERE synced = 0;'
      ) as { count: number };

      return result?.count || 0;
    } catch (error) {
      console.error('❌ Error getting local records count:', error);
      return 0;
    }
  }

  async getAllLocalRecords(userId: string): Promise<LocalTrainingRecord[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const result = await this.db!.getAllAsync(
        'SELECT * FROM records_local WHERE userId = ? ORDER BY timestamp DESC;',
        [userId]
      );

      return result as LocalTrainingRecord[];
    } catch (error) {
      console.error('❌ Error getting all local records:', error);
      return [];
    }
  }

  async clearSyncedRecords(): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      await this.db!.runAsync('DELETE FROM records_local WHERE synced = 1;');
      console.log('✅ Cleared synced records from SQLite');
    } catch (error) {
      console.error('❌ Error clearing synced records:', error);
    }
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('✅ SQLite database closed');
    }
  }
}

export default new SQLiteService(); 
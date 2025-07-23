/**
 * Data encryption at rest and in transit
 * Comprehensive encryption utilities for securing sensitive data
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt, createHash, pbkdf2Sync } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface EncryptionConfig {
  algorithm: string;
  keyDerivation: 'pbkdf2' | 'scrypt';
  keyLength: number;
  ivLength: number;
  saltLength: number;
  iterations: number;
  hashAlgorithm: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyDerivation: string;
  iterations: number;
  tag?: string; // For authenticated encryption
}

export interface DatabaseFieldEncryption {
  fieldName: string;
  encryptionKey: string;
  algorithm: string;
}

export interface TransitEncryptionConfig {
  certificatePath: string;
  privateKeyPath: string;
  caCertPath?: string;
  protocols: string[];
  ciphers: string[];
  honorCipherOrder: boolean;
  secureRenegotiation: boolean;
}

/**
 * Advanced encryption utilities for data protection
 */
export class EncryptionManager {
  private static readonly DEFAULT_CONFIG: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'scrypt',
    keyLength: 32, // 256 bits
    ivLength: 16,  // 128 bits
    saltLength: 32, // 256 bits
    iterations: 100000, // PBKDF2 iterations
    hashAlgorithm: 'sha256'
  };

  private config: EncryptionConfig;

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...EncryptionManager.DEFAULT_CONFIG, ...config };
  }

  /**
   * Encrypt sensitive data with authenticated encryption
   */
  async encryptData(
    plaintext: string,
    password: string,
    options: Partial<EncryptionConfig> = {}
  ): Promise<EncryptedData> {
    try {
      const config = { ...this.config, ...options };
      
      // Generate cryptographically secure random values
      const salt = randomBytes(config.saltLength);
      const iv = randomBytes(config.ivLength);
      
      // Derive encryption key
      const key = await this.deriveKey(password, salt, config);
      
      // Create cipher
      const cipher = createCipheriv(config.algorithm, key, iv);
      
      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag for GCM mode
      let tag: string | undefined;
      if (config.algorithm.includes('gcm')) {
        tag = (cipher as any).getAuthTag().toString('hex');
      }
      
      return {
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        algorithm: config.algorithm,
        keyDerivation: config.keyDerivation,
        iterations: config.iterations,
        tag
      };
      
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt encrypted data with authentication verification
   */
  async decryptData(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      const { data, iv, salt, algorithm, keyDerivation, iterations, tag } = encryptedData;
      
      // Convert hex strings back to buffers
      const ivBuffer = Buffer.from(iv, 'hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      
      // Derive the same key
      const config = {
        ...this.config,
        algorithm,
        keyDerivation,
        iterations
      } as EncryptionConfig;
      
      const key = await this.deriveKey(password, saltBuffer, config);
      
      // Create decipher
      const decipher = createDecipheriv(algorithm, key, ivBuffer);
      
      // Set authentication tag for GCM mode
      if (algorithm.includes('gcm') && tag) {
        (decipher as any).setAuthTag(Buffer.from(tag, 'hex'));
      }
      
      // Decrypt data
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
      
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt database field values
   */
  async encryptFieldValue(
    value: any,
    fieldConfig: DatabaseFieldEncryption
  ): Promise<string> {
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = await this.encryptData(plaintext, fieldConfig.encryptionKey);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt database field values
   */
  async decryptFieldValue(
    encryptedValue: string,
    fieldConfig: DatabaseFieldEncryption
  ): Promise<any> {
    try {
      const encryptedData: EncryptedData = JSON.parse(encryptedValue);
      const decrypted = await this.decryptData(encryptedData, fieldConfig.encryptionKey);
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      throw new Error(`Field decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate secure encryption key
   */
  generateEncryptionKey(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data (one-way)
   */
  hashData(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || randomBytes(32).toString('hex');
    const hash = createHash(this.config.hashAlgorithm)
      .update(data + actualSalt)
      .digest('hex');
    
    return { hash, salt: actualSalt };
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const computed = createHash(this.config.hashAlgorithm)
      .update(data + salt)
      .digest('hex');
    
    return this.constantTimeCompare(computed, hash);
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }

  /**
   * Create HMAC for data integrity
   */
  createHMAC(data: string, secret: string): string {
    const hmac = createHash('sha256');
    hmac.update(data + secret);
    return hmac.digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, signature: string, secret: string): boolean {
    const computed = this.createHMAC(data, secret);
    return this.constantTimeCompare(computed, signature);
  }

  // Private helper methods

  private async deriveKey(
    password: string,
    salt: Buffer,
    config: EncryptionConfig
  ): Promise<Buffer> {
    if (config.keyDerivation === 'scrypt') {
      return (await scryptAsync(password, salt, config.keyLength)) as Buffer;
    } else {
      return pbkdf2Sync(password, salt, config.iterations, config.keyLength, config.hashAlgorithm);
    }
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

/**
 * Database encryption utilities
 */
export class DatabaseEncryption {
  private encryptionManager: EncryptionManager;
  private fieldConfigs: Map<string, DatabaseFieldEncryption> = new Map();

  constructor() {
    this.encryptionManager = new EncryptionManager();
    this.setupFieldConfigurations();
  }

  /**
   * Register field for encryption
   */
  registerField(
    tableName: string,
    fieldName: string,
    encryptionKey: string,
    algorithm: string = 'aes-256-gcm'
  ): void {
    const configKey = `${tableName}.${fieldName}`;
    this.fieldConfigs.set(configKey, {
      fieldName,
      encryptionKey,
      algorithm
    });
  }

  /**
   * Encrypt data before database storage
   */
  async encryptForStorage(
    tableName: string,
    fieldName: string,
    value: any
  ): Promise<string> {
    const configKey = `${tableName}.${fieldName}`;
    const fieldConfig = this.fieldConfigs.get(configKey);
    
    if (!fieldConfig) {
      throw new Error(`No encryption config found for ${configKey}`);
    }
    
    return this.encryptionManager.encryptFieldValue(value, fieldConfig);
  }

  /**
   * Decrypt data after database retrieval
   */
  async decryptFromStorage(
    tableName: string,
    fieldName: string,
    encryptedValue: string
  ): Promise<any> {
    const configKey = `${tableName}.${fieldName}`;
    const fieldConfig = this.fieldConfigs.get(configKey);
    
    if (!fieldConfig) {
      throw new Error(`No encryption config found for ${configKey}`);
    }
    
    return this.encryptionManager.decryptFieldValue(encryptedValue, fieldConfig);
  }

  /**
   * Middleware for automatic encryption/decryption
   */
  createPrismaMiddleware() {
    return async (params: any, next: any) => {
      // Encrypt on create/update operations
      if (['create', 'update', 'upsert'].includes(params.action)) {
        await this.encryptPrismaData(params);
      }
      
      const result = await next(params);
      
      // Decrypt on read operations
      if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
        await this.decryptPrismaData(result, params.model);
      }
      
      return result;
    };
  }

  private async encryptPrismaData(params: any): Promise<void> {
    if (!params.args.data) return;
    
    const tableName = params.model.toLowerCase();
    
    for (const [fieldName, value] of Object.entries(params.args.data)) {
      const configKey = `${tableName}.${fieldName}`;
      
      if (this.fieldConfigs.has(configKey)) {
        params.args.data[fieldName] = await this.encryptForStorage(
          tableName,
          fieldName,
          value
        );
      }
    }
  }

  private async decryptPrismaData(result: any, modelName: string): Promise<void> {
    if (!result) return;
    
    const tableName = modelName.toLowerCase();
    const records = Array.isArray(result) ? result : [result];
    
    for (const record of records) {
      for (const fieldName of Object.keys(record)) {
        const configKey = `${tableName}.${fieldName}`;
        
        if (this.fieldConfigs.has(configKey) && record[fieldName]) {
          try {
            record[fieldName] = await this.decryptFromStorage(
              tableName,
              fieldName,
              record[fieldName]
            );
          } catch (error) {
            console.error(`Failed to decrypt ${configKey}:`, error);
            // Keep encrypted value to prevent data loss
          }
        }
      }
    }
  }

  private setupFieldConfigurations(): void {
    // Configure sensitive fields for encryption
    const masterKey = process.env.DATABASE_ENCRYPTION_KEY || this.encryptionManager.generateEncryptionKey();
    
    // User sensitive data
    this.registerField('users', 'email', masterKey);
    this.registerField('users', 'phone', masterKey);
    
    // Driver sensitive data
    this.registerField('drivers', 'phone', masterKey);
    this.registerField('drivers', 'address', masterKey);
    
    // Financial data
    this.registerField('sales', 'notes', masterKey);
    this.registerField('expenses', 'description', masterKey);
    
    // Add more fields as needed
  }
}

/**
 * Transport Layer Security utilities
 */
export class TransportSecurity {
  private config: TransitEncryptionConfig;

  constructor(config: TransitEncryptionConfig) {
    this.config = config;
  }

  /**
   * Get TLS configuration for HTTPS server
   */
  getTLSConfig(): any {
    return {
      cert: this.loadCertificate(this.config.certificatePath),
      key: this.loadPrivateKey(this.config.privateKeyPath),
      ca: this.config.caCertPath ? this.loadCertificate(this.config.caCertPath) : undefined,
      secureProtocol: 'TLSv1_2_method',
      ciphers: this.config.ciphers.join(':'),
      honorCipherOrder: this.config.honorCipherOrder,
      secureOptions: this.getSecureOptions(),
    };
  }

  /**
   * Create secure HTTP client configuration
   */
  createSecureHttpClient(): any {
    return {
      httpsAgent: new (require('https').Agent)({
        cert: this.loadCertificate(this.config.certificatePath),
        key: this.loadPrivateKey(this.config.privateKeyPath),
        ca: this.config.caCertPath ? this.loadCertificate(this.config.caCertPath) : undefined,
        rejectUnauthorized: true,
        checkServerIdentity: this.checkServerIdentity.bind(this),
      }),
    };
  }

  /**
   * Validate SSL certificate
   */
  async validateCertificate(hostname: string, port: number = 443): Promise<{
    valid: boolean;
    issuer?: string;
    subject?: string;
    validFrom?: Date;
    validTo?: Date;
    fingerprint?: string;
    errors: string[];
  }> {
    return new Promise((resolve) => {
      const socket = require('tls').connect({
        host: hostname,
        port,
        rejectUnauthorized: false,
      }, () => {
        const cert = socket.getPeerCertificate();
        
        resolve({
          valid: socket.authorized,
          issuer: cert.issuer?.CN,
          subject: cert.subject?.CN,
          validFrom: new Date(cert.valid_from),
          validTo: new Date(cert.valid_to),
          fingerprint: cert.fingerprint,
          errors: socket.authorizationError ? [socket.authorizationError] : []
        });
        
        socket.end();
      });
      
      socket.on('error', (error: Error) => {
        resolve({
          valid: false,
          errors: [error.message]
        });
      });
    });
  }

  private loadCertificate(path: string): Buffer {
    const fs = require('fs');
    return fs.readFileSync(path);
  }

  private loadPrivateKey(path: string): Buffer {
    const fs = require('fs');
    return fs.readFileSync(path);
  }

  private getSecureOptions(): number {
    const constants = require('constants');
    return (
      constants.SSL_OP_NO_SSLv2 |
      constants.SSL_OP_NO_SSLv3 |
      constants.SSL_OP_NO_TLSv1 |
      constants.SSL_OP_NO_TLSv1_1 |
      constants.SSL_OP_CIPHER_SERVER_PREFERENCE
    );
  }

  private checkServerIdentity(hostname: string, cert: any): Error | undefined {
    // Custom server identity checking logic
    const { checkServerIdentity } = require('tls');
    return checkServerIdentity(hostname, cert);
  }
}

/**
 * Key management utilities
 */
export class KeyManager {
  private keys: Map<string, string> = new Map();
  private rotationIntervals: Map<string, number> = new Map();

  /**
   * Generate and store encryption key
   */
  generateKey(keyId: string, length: number = 32): string {
    const key = randomBytes(length).toString('hex');
    this.keys.set(keyId, key);
    return key;
  }

  /**
   * Get encryption key
   */
  getKey(keyId: string): string {
    const key = this.keys.get(keyId);
    if (!key) {
      throw new Error(`Key not found: ${keyId}`);
    }
    return key;
  }

  /**
   * Rotate encryption key
   */
  rotateKey(keyId: string, length: number = 32): { oldKey: string; newKey: string } {
    const oldKey = this.getKey(keyId);
    const newKey = this.generateKey(keyId, length);
    
    return { oldKey, newKey };
  }

  /**
   * Setup automatic key rotation
   */
  setupKeyRotation(keyId: string, intervalHours: number = 24 * 30): void {
    this.rotationIntervals.set(keyId, intervalHours);
    
    setInterval(() => {
      this.rotateKey(keyId);
      console.log(`Key rotated: ${keyId}`);
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Export keys for backup (encrypted)
   */
  async exportKeys(masterPassword: string): Promise<string> {
    const encryptionManager = new EncryptionManager();
    const keyData = Object.fromEntries(this.keys);
    
    return encryptionManager.encryptData(
      JSON.stringify(keyData),
      masterPassword
    ).then(encrypted => JSON.stringify(encrypted));
  }

  /**
   * Import keys from backup
   */
  async importKeys(encryptedKeyData: string, masterPassword: string): Promise<void> {
    const encryptionManager = new EncryptionManager();
    const encryptedData: EncryptedData = JSON.parse(encryptedKeyData);
    
    const decrypted = await encryptionManager.decryptData(encryptedData, masterPassword);
    const keyData = JSON.parse(decrypted);
    
    for (const [keyId, key] of Object.entries(keyData)) {
      this.keys.set(keyId, key as string);
    }
  }
}

// Singleton instances for global use
export const encryptionManager = new EncryptionManager();
export const databaseEncryption = new DatabaseEncryption();
export const keyManager = new KeyManager();

// Default transport security config
export const DEFAULT_TRANSIT_CONFIG: TransitEncryptionConfig = {
  certificatePath: process.env.TLS_CERT_PATH || '/etc/ssl/certs/server.crt',
  privateKeyPath: process.env.TLS_KEY_PATH || '/etc/ssl/private/server.key',
  caCertPath: process.env.TLS_CA_PATH,
  protocols: ['TLSv1.2', 'TLSv1.3'],
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ],
  honorCipherOrder: true,
  secureRenegotiation: true
};
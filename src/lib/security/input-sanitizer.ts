/**
 * Input sanitization and SQL injection prevention
 * Comprehensive input validation and sanitization for all user inputs
 */

// import DOMPurify from 'isomorphic-dompurify';
// import validator from 'validator';
import { NextRequest } from 'next/server';

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  stripWhitespace?: boolean;
  normalizeUnicode?: boolean;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'email' | 'phone' | 'url' | 'date' | 'boolean' | 'enum' | 'json';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enumValues?: string[];
  customValidator?: (value: any) => boolean;
  sanitizationOptions?: SanitizationOptions;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedData: any;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Comprehensive input sanitizer and validator
 */
export class InputSanitizer {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
    /(\b(or|and)\s+\d+\s*=\s*\d+)/gi,
    /('|\"|`|;|--|\/\*|\*\/)/gi,
    /(\bscript\b|\bonload\b|\bonerror\b)/gi
  ];

  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi
  ];

  private static readonly LDAP_INJECTION_PATTERNS = [
    /[\(\)\*\|&=!<>~]/g,
    /[\x00-\x1f\x7f]/g
  ];

  /**
   * Sanitize and validate request data
   */
  static async sanitizeRequest(
    request: NextRequest,
    validationRules: ValidationRule[]
  ): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];
    const sanitizedData: any = {};

    try {
      // Extract data from request
      const contentType = request.headers.get('content-type') || '';
      let requestData: any = {};

      if (contentType.includes('application/json')) {
        try {
          requestData = await request.json();
        } catch (error) {
          errors.push({
            field: 'body',
            message: 'Invalid JSON format',
            code: 'INVALID_JSON'
          });
          return { isValid: false, sanitizedData: {}, errors, warnings };
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        requestData = Object.fromEntries(formData.entries());
      }

      // Add query parameters
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        requestData[key] = value;
      });

      // Validate and sanitize each field
      for (const rule of validationRules) {
        const fieldResult = this.validateAndSanitizeField(
          requestData[rule.field],
          rule
        );

        if (fieldResult.errors.length > 0) {
          errors.push(...fieldResult.errors);
        }

        if (fieldResult.warnings.length > 0) {
          warnings.push(...fieldResult.warnings);
        }

        if (fieldResult.sanitizedValue !== undefined) {
          sanitizedData[rule.field] = fieldResult.sanitizedValue;
        }
      }

      return {
        isValid: errors.length === 0,
        sanitizedData,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        field: 'request',
        message: `Request processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'PROCESSING_ERROR'
      });

      return { isValid: false, sanitizedData: {}, errors, warnings };
    }
  }

  /**
   * Validate and sanitize individual field
   */
  static validateAndSanitizeField(
    value: any,
    rule: ValidationRule
  ): {
    sanitizedValue?: any;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];
    let sanitizedValue: any;

    // Handle required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: rule.field,
        message: `${rule.field} is required`,
        code: 'REQUIRED_FIELD'
      });
      return { errors, warnings };
    }

    // Skip validation for optional empty fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { sanitizedValue: value, errors, warnings };
    }

    // Type-specific validation and sanitization
    switch (rule.type) {
      case 'string':
        sanitizedValue = this.sanitizeString(value, rule.sanitizationOptions);
        this.validateString(sanitizedValue, rule, errors, warnings);
        break;

      case 'number':
        sanitizedValue = this.sanitizeNumber(value);
        this.validateNumber(sanitizedValue, rule, errors, warnings);
        break;

      case 'email':
        sanitizedValue = this.sanitizeEmail(value);
        this.validateEmail(sanitizedValue, rule, errors, warnings);
        break;

      case 'phone':
        sanitizedValue = this.sanitizePhone(value);
        this.validatePhone(sanitizedValue, rule, errors, warnings);
        break;

      case 'url':
        sanitizedValue = this.sanitizeUrl(value);
        this.validateUrl(sanitizedValue, rule, errors, warnings);
        break;

      case 'date':
        sanitizedValue = this.sanitizeDate(value);
        this.validateDate(sanitizedValue, rule, errors, warnings);
        break;

      case 'boolean':
        sanitizedValue = this.sanitizeBoolean(value);
        break;

      case 'enum':
        sanitizedValue = this.sanitizeEnum(value, rule);
        this.validateEnum(sanitizedValue, rule, errors, warnings);
        break;

      case 'json':
        sanitizedValue = this.sanitizeJson(value);
        this.validateJson(sanitizedValue, rule, errors, warnings);
        break;

      default:
        errors.push({
          field: rule.field,
          message: `Unknown validation type: ${rule.type}`,
          code: 'UNKNOWN_TYPE'
        });
        return { errors, warnings };
    }

    // Apply custom validator if provided
    if (rule.customValidator && !rule.customValidator(sanitizedValue)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} failed custom validation`,
        code: 'CUSTOM_VALIDATION_FAILED'
      });
    }

    // Check for potential security threats
    const securityCheck = this.checkSecurityThreats(sanitizedValue, rule.field);
    if (securityCheck.hasThreats) {
      errors.push(...securityCheck.errors);
      warnings.push(...securityCheck.warnings);
    }

    return { sanitizedValue, errors, warnings };
  }

  /**
   * Sanitize string input
   */
  private static sanitizeString(value: any, options: SanitizationOptions = {}): string {
    if (typeof value !== 'string') {
      value = String(value);
    }

    // Basic sanitization
    let sanitized = value;

    // Normalize unicode
    if (options.normalizeUnicode !== false) {
      sanitized = sanitized.normalize('NFKC');
    }

    // Strip whitespace
    if (options.stripWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Handle HTML
    if (options.allowHtml) {
      // Simple HTML sanitization - remove dangerous tags and attributes
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else {
      // Strip all HTML
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Apply max length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }

  /**
   * Validate string constraints
   */
  private static validateString(
    value: string,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be at least ${rule.minLength} characters`,
        code: 'MIN_LENGTH'
      });
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must not exceed ${rule.maxLength} characters`,
        code: 'MAX_LENGTH'
      });
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} format is invalid`,
        code: 'INVALID_FORMAT'
      });
    }
  }

  /**
   * Sanitize and validate number input
   */
  private static sanitizeNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private static validateNumber(
    value: number | null,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    if (value === null) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be a valid number`,
        code: 'INVALID_NUMBER'
      });
      return;
    }

    if (rule.min !== undefined && value < rule.min) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be at least ${rule.min}`,
        code: 'MIN_VALUE'
      });
    }

    if (rule.max !== undefined && value > rule.max) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must not exceed ${rule.max}`,
        code: 'MAX_VALUE'
      });
    }
  }

  /**
   * Sanitize and validate email
   */
  private static sanitizeEmail(value: any): string {
    if (typeof value !== 'string') return '';
    return value.toLowerCase().trim();
  }

  private static validateEmail(
    value: string,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be a valid email address`,
        code: 'INVALID_EMAIL'
      });
    }
  }

  /**
   * Sanitize and validate phone number
   */
  private static sanitizePhone(value: any): string {
    if (typeof value !== 'string') return '';
    return value.replace(/[^\d+\-\s()]/g, '').trim();
  }

  private static validatePhone(
    value: string,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    // Simple phone validation - allows numbers, spaces, +, -, (, )
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(value)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be a valid phone number`,
        code: 'INVALID_PHONE'
      });
    }
  }

  /**
   * Sanitize and validate URL
   */
  private static sanitizeUrl(value: any): string {
    if (typeof value !== 'string') return '';
    return value.trim();
  }

  private static validateUrl(
    value: string,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    // Simple URL validation
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlRegex.test(value)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be a valid URL`,
        code: 'INVALID_URL'
      });
    }
  }

  /**
   * Sanitize and validate date
   */
  private static sanitizeDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  private static validateDate(
    value: Date | null,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    if (value === null) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be a valid date`,
        code: 'INVALID_DATE'
      });
    }
  }

  /**
   * Sanitize boolean
   */
  private static sanitizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return Boolean(value);
  }

  /**
   * Sanitize and validate enum
   */
  private static sanitizeEnum(value: any, rule: ValidationRule): string {
    if (typeof value !== 'string') return '';
    return value.trim();
  }

  private static validateEnum(
    value: string,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    if (rule.enumValues && !rule.enumValues.includes(value)) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be one of: ${rule.enumValues.join(', ')}`,
        code: 'INVALID_ENUM'
      });
    }
  }

  /**
   * Sanitize and validate JSON
   */
  private static sanitizeJson(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  private static validateJson(
    value: any,
    rule: ValidationRule,
    errors: Array<{ field: string; message: string; code: string }>,
    warnings: Array<{ field: string; message: string }>
  ): void {
    if (value === null) {
      errors.push({
        field: rule.field,
        message: `${rule.field} must be valid JSON`,
        code: 'INVALID_JSON'
      });
    }
  }

  /**
   * Check for security threats in input
   */
  private static checkSecurityThreats(
    value: any,
    fieldName: string
  ): {
    hasThreats: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
    warnings: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    if (typeof value !== 'string') {
      return { hasThreats: false, errors, warnings };
    }

    // Check for SQL injection
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: 'Potential SQL injection detected',
          code: 'SQL_INJECTION'
        });
        break;
      }
    }

    // Check for XSS
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: 'Potential XSS attack detected',
          code: 'XSS_ATTACK'
        });
        break;
      }
    }

    // Check for LDAP injection
    for (const pattern of this.LDAP_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        warnings.push({
          field: fieldName,
          message: 'Potential LDAP injection characters detected'
        });
        break;
      }
    }

    // Check for path traversal
    if (value.includes('../') || value.includes('..\\')) {
      errors.push({
        field: fieldName,
        message: 'Path traversal attempt detected',
        code: 'PATH_TRAVERSAL'
      });
    }

    // Check for command injection
    const commandPatterns = [
      /[;&|`$(){}]/g,
      /(wget|curl|nc|netcat|bash|sh|powershell|cmd)/gi
    ];

    for (const pattern of commandPatterns) {
      if (pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: 'Potential command injection detected',
          code: 'COMMAND_INJECTION'
        });
        break;
      }
    }

    return {
      hasThreats: errors.length > 0 || warnings.length > 0,
      errors,
      warnings
    };
  }

  /**
   * Create sanitization middleware
   */
  static createSanitizationMiddleware(validationRules: ValidationRule[]) {
    return async function sanitizeMiddleware(request: NextRequest) {
      const result = await InputSanitizer.sanitizeRequest(request, validationRules);
      
      if (!result.isValid) {
        return {
          status: 400,
          error: 'Input validation failed',
          details: result.errors
        };
      }

      return {
        status: 200,
        sanitizedData: result.sanitizedData,
        warnings: result.warnings
      };
    };
  }

  /**
   * Escape SQL identifiers and values
   */
  static escapeSql(value: string): string {
    return value.replace(/'/g, "''").replace(/\\/g, '\\\\');
  }

  /**
   * Validate SQL query for safety
   */
  static validateSqlQuery(query: string, allowedTables: string[] = []): boolean {
    const queryLower = query.toLowerCase();
    
    // Check for forbidden SQL operations
    const forbiddenOperations = ['drop', 'truncate', 'alter', 'create', 'exec', 'execute'];
    for (const op of forbiddenOperations) {
      if (queryLower.includes(op)) return false;
    }

    // If table whitelist is provided, validate table names
    if (allowedTables.length > 0) {
      const tablePattern = /(?:from|join|into|update)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
      const matches = query.match(tablePattern);
      
      if (matches) {
        for (const match of matches) {
          const tableName = match.split(/\s+/)[1];
          if (!allowedTables.includes(tableName.toLowerCase())) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
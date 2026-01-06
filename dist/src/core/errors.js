"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = exports.FileSystemError = exports.APIError = exports.JPMError = void 0;
class JPMError extends Error {
    code;
    constructor(message, code = 'JPM_ERROR') {
        super(message);
        this.code = code;
        this.name = 'JPMError';
    }
}
exports.JPMError = JPMError;
class APIError extends JPMError {
    statusCode;
    retryable;
    constructor(message, statusCode, retryable = true) {
        super(message, 'API_ERROR');
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.name = 'APIError';
    }
}
exports.APIError = APIError;
class FileSystemError extends JPMError {
    path;
    constructor(message, path) {
        super(message); // Removed 'FILE_SYSTEM_ERROR' as JPMError no longer has a 'code' field
        this.path = path;
        this.name = 'FileSystemError';
    }
}
exports.FileSystemError = FileSystemError;
class ConfigError extends JPMError {
    constructor(message) {
        super(message); // Removed 'CONFIG_ERROR' as JPMError no longer has a 'code' field
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;

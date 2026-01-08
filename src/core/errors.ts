export class JPMError extends Error {
    constructor(
        message: string,
        public code: string = 'JPM_ERROR',
    ) {
        super(message);
        this.name = 'JPMError';
    }
}

export class APIError extends JPMError {
    constructor(
        message: string,
        public statusCode?: number,
        public retryable: boolean = true,
    ) {
        super(message, 'API_ERROR');
        this.name = 'APIError';
    }
}

export class FileSystemError extends JPMError {
    constructor(
        message: string,
        public path?: string,
    ) {
        super(message); // Removed 'FILE_SYSTEM_ERROR' as JPMError no longer has a 'code' field
        this.name = 'FileSystemError';
    }
}

export class ConfigError extends JPMError {
    constructor(message: string) {
        super(message); // Removed 'CONFIG_ERROR' as JPMError no longer has a 'code' field
        this.name = 'ConfigError';
    }
}

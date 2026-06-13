export class AppException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Error with input validation or business logic violation
export class ValidationException extends AppException {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

// Error when a requested resource is not found
export class NotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    super( 404, id ? `${resource} with ID ${id} not found` : `${resource} not found`,   'NOT_FOUND' );
  }
}

// Error when a resource already exists or there's a conflict in the request
export class ConflictException extends AppException {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

// Error when authentication fails or user is not authorized to access a resource
export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

// Error when user is authenticated but does not have permission to access a resource
export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

// Error for unexpected server issues or unhandled exceptions
export class InternalServerException extends AppException {
  constructor(message = 'Internal Server Error') {
    super(500, message, 'INTERNAL_SERVER_ERROR');
  }
}
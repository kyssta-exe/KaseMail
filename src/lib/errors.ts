export class AppError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AppError"
    this.status = status
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", 401)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("Forbidden", 403)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends AppError {
  issues: any[]
  constructor(issues: any[]) {
    super("Validation error", 400)
    this.name = "ValidationError"
    this.issues = issues
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("Too many requests", 429)
    this.name = "RateLimitError"
  }
}

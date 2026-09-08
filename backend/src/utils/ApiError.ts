class ApiError extends Error {
  statusCode: number;
  errors: any[];
  data: any;
  success: boolean;
  code: string | undefined;
  constructor(
    statusCode: number,
    message = "something went wrong",
    errors = [],
    stack = "",
    code?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.stack = stack;
    this.errors = errors;
    this.data = null;
    this.success = false;
    this.code = code;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };

export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFoundHandler = () => new HttpError(404, "Not Found", "NOT_FOUND");

export const errorHandler = (
  err: unknown,
  _req: unknown,
  res: { status: (code: number) => { json: (payload: unknown) => void } },
  _next: unknown
) => {
  const error = err instanceof HttpError ? err : new HttpError(500, "Internal Server Error");
  res.status(error.status).json({
    error: {
      message: error.message,
      code: error.code ?? "INTERNAL_ERROR"
    }
  });
};

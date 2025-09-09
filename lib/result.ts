export type Result<T, E = string> = 
  | { ok: true; data: T }
  | { ok: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function failure<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok;
}

export function isFailure<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  return result.ok ? success(fn(result.data)) : result;
}

export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.ok ? result : failure(fn(result.error));
}

export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.data) : result;
}

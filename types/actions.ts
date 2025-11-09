/**
 * Standard return type for Server Actions
 * Use this instead of throwing errors to provide better error handling
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Type guard to check if action result is successful
 */
export function isActionSuccess<T>(
  result: ActionResult<T>,
): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Type guard to check if action result is an error
 */
export function isActionError<T>(
  result: ActionResult<T>,
): result is { success: false; error: string } {
  return result.success === false
}

/**
 *
 * ErrorMessage class
 *
 * Centralize error message generation and prepend their origin to the message
 */
export class ErrorMessage {
  /**
   * Throws an error with the origin class name prepended
   * @param message {string} - Error message
   */
  protected error(message: string): void {
    const errorMessage = `${this.constructor.name}: ${message}`;
    console.error(errorMessage);
    // throw new Error(errorMessage);
  }
}

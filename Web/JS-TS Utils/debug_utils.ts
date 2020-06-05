export class DebugUtils {

  private static DEBUG_MODE = true;

  static Alert(message): void {
    if (DebugUtils.DEBUG_MODE) {
      alert(message);
    }
  }

  static ConsoleLogs(...objects): void {
    if (DebugUtils.DEBUG_MODE) {
      for (const obj of objects) {
        console.log(obj);
      }
    }
  }
}

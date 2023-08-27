import {environment} from "../environments/environment";

export class DebugUtils {

  static alert(message): void {
    if (environment.debug) {
      alert(message);
    }
  }

  static debug(...objects): void {
    if (environment.debug) {
      for (const obj of objects) {
        console.log(obj);
      }
    }
  }
}

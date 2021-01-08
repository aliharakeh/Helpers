export class CopyUtils {

  static deepStringCopy(str: string): string {
    return (' ' + str).slice(1);
  }

  static deepObjectCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }
}

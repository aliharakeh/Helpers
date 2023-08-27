export interface IServerResponse {
  data: any;
  status: number;
  message: string;
}

export class ServerResponse {
  public data: any;
  public status: number;
  public message: string;

  constructor(response: any) {
    if (this._checkResponseContent(response))
      Object.assign(this, response);
    else {
      this.data = response;
      this.status = 200;
      this.message = 'only json data';
    }
  }

  _checkResponseContent(response) {
    if (!response) return false;
    const responseKeys = Object.keys(response);
    const requiredKeys = ['data', 'status', 'message'];
    const foundKeys = requiredKeys.filter(key => responseKeys.includes(key));
    return foundKeys.length === 3;
  }

  castTo<T>(classType: { new(data): T }): T {
    return new classType(this.data);
  }

  mapTo<T>(classType: { new(data): T }): T[] {
    return this.data.map(d => new classType(d));
  }

  get(key: string) {
    return this.data[key];
  }

  getAs<T>(key: string, classType: { new(data): T }): T {
    return new classType(this.data[key]);
  }

  mapAs<T>(key: string, classType: { new(data): T }): T[] {
    return this.data[key].map(d => new classType(d));
  }

  isOk() {
    return this.status < 400 && this.message === 'ok';
  }

  getError() {
    return `Response Error with status [${this.status}]: ${this.message}`;
  }

}

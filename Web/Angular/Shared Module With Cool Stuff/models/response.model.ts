export interface IServerResponse {
  data: any;
  status: number;
  message: string;
}

export class ServerResponse {
  public data: any;
  public status: number;
  public message: string;

  constructor(response: IServerResponse) {
    Object.assign(this, response);
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

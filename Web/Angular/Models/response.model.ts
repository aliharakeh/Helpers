export interface IServerResponse {
  data: any;
  status: number;
  message: string;
}

export class ServerResponse {
  data: any;
  status: number;
  message: string;

  constructor(response: IServerResponse) {
    this.data = response.data;
    this.status = response.status;
    this.message = response.message;
  }

  isOk() {
    return this.status < 400 && this.message === 'ok';
  }

  getError() {
    return `Error with status [${this.status}]: ${this.message}`;
  }

}

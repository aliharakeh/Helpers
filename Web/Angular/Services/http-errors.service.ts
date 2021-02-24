import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ObservableInput, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorsService {

  constructor() {}

  handleError(error: HttpErrorResponse, caught: Observable<any>): ObservableInput<any> {
    const data = {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      source: error.url
    };
    alert(JSON.stringify(data, null, 2));
    return throwError(error);
  }
}

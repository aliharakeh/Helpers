import { BehaviorSubject, Observable, pipe, ReplaySubject } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

export class SubjectStore {
  // the data storage
  protected behaviorSubject$: BehaviorSubject<any> = null;
  // observes data changes
  protected observable = null;
  // list of applied operators
  protected operators = [];
  // notifies of operators changes
  protected newOperator$ = new BehaviorSubject(true);

  constructor(initialValue: any) {
    this.behaviorSubject$ = new BehaviorSubject(initialValue || null);
    this.observable = this.behaviorSubject$.asObservable();
  }

  // sets the data
  setValue(data: any): void {
    this.behaviorSubject$.next(data);
  }

  // gets the data
  getValue(): any {
    return this.behaviorSubject$.value;
  }


  /*
   adds a pipe operator

   example:
   --------
   subjectStore.addPipeOperator(map(data => data.filter(d => d.isAccepted));
   */
  addPipeOperator(operator: any) {
    this.operators.push(operator);
    this.newOperator$.next(true);
  }

  // add many pipe operators
  addManyPipeOperator(operators: any[]) {
    operators.forEach(operator => this.operators.push(operator));
    this.newOperator$.next(true);
  }

  // pops last pipe operator
  popLastPipeOperator() {
    this.operators.pop();
    this.newOperator$.next(true);
  }

  // removes a pipe operator by order of addition
  removePipeOperator(index: number) {
    this.operators = this.operators.splice(index, 1);
    this.newOperator$.next(true);
  }

  // resets pipe operators
  resetPipeOperators() {
    this.operators = [];
    this.newOperator$.next(true);
  }

  // applies a pipe operator
  _applyPipeOperators(arg?: {}) {
    return pipe.apply(this, this.operators);
  }

  // observes pipe operators and returns new data with them applied
  getObserver(): Observable<any> {
    return this.newOperator$.asObservable().pipe(
      switchMap(_ => this.observable.pipe(this._applyPipeOperators()))
    );
  }

  // resets everything
  reset(withValue?: any) {
    this.behaviorSubject$.complete();
    this.behaviorSubject$ = new BehaviorSubject(withValue || null);
    this.observable = this.behaviorSubject$.asObservable();
    this.operators = [];
    this.newOperator$ = new BehaviorSubject(true);
  }

  // destroy the data storage
  destroy() {
    this.behaviorSubject$.complete();
    this.behaviorSubject$ = null;
    this.observable = null;
    this.operators = null;
    this.newOperator$ = null;
  }
}

export class ArraySubject extends SubjectStore {
  constructor(initialValue: any[] = []) {
    super(initialValue);
  }

  // pushes an item into the array
  push(data: any): void {
    const oldData = this.getValue();
    this.setValue([...oldData, data]);
  }

  // updates an item in the array
  update(data: any, findBy?: (item) => boolean): void {
    const oldData = this.getValue();
    let oldValueIndex;
    if (findBy) oldValueIndex = oldData.findIndex(findBy);
    else oldValueIndex = oldData.findIndex(item => JSON.stringify(item) === JSON.stringify(data));
    const newData = [...oldData];
    newData[oldValueIndex] = data;
    this.setValue(newData);
  }

  // pops the last array item
  pop(): void {
    const oldData = this.getValue();
    oldData.pop();
    this.setValue([...oldData]);
  }

  // removes an array item
  remove(data: any, findBy?: (item) => boolean): void {
    const oldData = this.getValue();
    let oldValueIndex;
    if (findBy) oldValueIndex = oldData.findIndex(findBy);
    else oldValueIndex = oldData.findIndex(item => JSON.stringify(item) === JSON.stringify(data));
    this.setValue(oldData.splice(oldValueIndex, 1));
  }

  // filters array data until this operation is removed
  filter(filterBy: (item) => boolean) {
    this.addPipeOperator(map((data: any[]) => data.filter(filterBy)));
  }

  // maps array data until this operation is removed
  map(mapBy: (item) => any) {
    this.addPipeOperator(map((data: any[]) => data.map(mapBy)));
  }

  // reduces array data until this operation is removed
  reduce(reduceBy: (item) => any, initValue) {
    this.addPipeOperator(map((data: any[]) => data.reduce(reduceBy, initValue)));
  }
}

export class ObjectSubject extends SubjectStore {
  constructor(initialValue: {} = {}) {
    super(initialValue);
  }

  // adds a property from the objects
  add(key: string, data: any): void {
    const oldData = this.getValue();
    this.setValue({
      ...oldData,
      key: data
    });
  }

  // removes a property from the objects
  remove(key: string): void {
    const oldData = this.getValue();
    if (oldData.hasOwnProperty(key)) delete oldData[key];
    this.setValue({ ...oldData });
  }
}

export class CacheSubject {
  public replaySubject$: ReplaySubject<any> = null;
  public observable = null;
  private _count = 0;
  private _done = [];
  private readonly _maxDataToSave = undefined;
  private readonly _deleteDataAfter = undefined;

  constructor(maxDataToSave?: number, deleteDataAfter?: number) {
    this._maxDataToSave = maxDataToSave;
    this._deleteDataAfter = deleteDataAfter;
    this._init();
  }

  _init() {
    this.replaySubject$ = new ReplaySubject(this._maxDataToSave, this._deleteDataAfter);
    this.observable = this.replaySubject$.asObservable();
    this._count = 0;
    this._done = [];
  }

  store(data: any): void {
    this.replaySubject$.next(data);
    this._count++;
  }

  getAvailable(): Observable<any> {
    return this.observable.pipe(
      take(this._count - this._done.length),
      filter(((value, index) => !this._done.includes(index)))
    );
  }

  getAll(): Observable<any> {
    return this.observable.pipe(take(this._count));
  }

  remove(index: number) {
    this._done.push(index);
    if (this._done.length === this._count) this._init();
  }
}

import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WizardService<T> {

    // global state
    public state: T;

    // current state
    public stepTitle = ''
    public currentState: any = {};
    public wizardActionIcon: string;
    public wizardAction: () => void | null = null;
    public disableNext = () => false;

    init() {
        this.clear();
        this.disableNext = () => false;
    }

    clearAction() {
        if (this.wizardActionIcon || this.wizardAction) {
            this.wizardActionIcon = null;
            this.wizardAction = null;
        }
    }

    clear() {
        // @ts-ignore
        this.state = {};
        this.currentState = {};
        this.clearAction();
    }
}

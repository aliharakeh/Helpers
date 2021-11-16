import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {WizardComponentItem} from '../../models/wizard.model';
import {WizardService} from '../../providers/utils/wizard.service';

@Component({
    selector: 'app-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit {

    @Input() title = '';
    @Input() components: WizardComponentItem[] = [];
    @Input() finishComponent: WizardComponentItem = null;
    @ViewChild('componentContent', { read: ViewContainerRef, static: true }) componentContent: ViewContainerRef;

    public currentComponentIndex;
    public optionalComponentsIds: Set<string>;
    public currentComponent: WizardComponentItem;
    public currentComponentRef;
    public isDone = false;
    public closed = false;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private modalCtrl: ModalController,
        public wizardService: WizardService<any>
    ) {}

    ngOnInit() {
        this.currentComponentIndex = 0;
        this.optionalComponentsIds = new Set();
        if (this.components.length > 0) {
            this.loadComponent(0);
        }
    }

    calc(value) {
        return value - this.optionalComponentsIds.size;
    }

    loadComponent(index, isBack = false) {
        this.currentComponentIndex = index;
        this.currentComponent = this.components[index] ?? this.finishComponent;
        this.isDone = !(!!this.components[index]);

        // clear previous components
        if (this.componentContent.length > 0) {
            this.componentContent.clear();
        }

        // create and inject the component content
        const componentContentFactory = this.componentFactoryResolver.resolveComponentFactory(this.currentComponent.component);
        this.currentComponentRef = this.componentContent.createComponent(componentContentFactory);

        // hide or show
        if (!this.isDone && this.currentComponentRef.instance.shouldHide()) {
            this.optionalComponentsIds = this.optionalComponentsIds.add(this.currentComponent.id);
            return this.loadComponent(isBack ? index - 1 : index + 1);
        }
        else if (this.optionalComponentsIds.has(this.currentComponent.id)) {
            this.optionalComponentsIds.delete(this.currentComponent.id);
        }

        // set the component state
        this.wizardService.currentState = this.currentComponent.data;
        const previousState = this.wizardService.state[this.currentComponent.id];
        const state = previousState ? previousState : {};
        Object.assign(this.currentComponentRef.instance, state);
    }

    prev() {
        if (this.currentComponentIndex - 1 >= 0) {
            // save state
            this.wizardService.state[this.currentComponent.id] = this.currentComponentRef.instance;
            this.wizardService.clearAction();
            this.loadComponent(this.currentComponentIndex - 1, true);
        }
    }

    next() {
        // save state
        this.wizardService.state[this.currentComponent.id] = this.currentComponentRef.instance;
        this.wizardService.clearAction();
        this.loadComponent(this.currentComponentIndex + 1);
    }

    close() {
        this.closed = true;
        this.wizardService.clear();
        this.modalCtrl.dismiss();
    }

}

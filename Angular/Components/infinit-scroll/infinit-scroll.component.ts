import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';

@Component({
	selector: 'app-infinit-scroll',
	template: `<div #inverseAnchor></div><ng-content></ng-content><div #anchor></div>`,
	styleUrls: ['./infinit-scroll.component.scss']
})
export class InfinitScrollComponent implements OnInit, OnDestroy {

	@Input() inverseScroll = false;
	@Input() hostAsRoot = false;
	@Input() scrollRoot: 'window' | 'host' | 'parent' | ElementRef = 'window';
	@Input() options = {};
	@Output() scrolled = new EventEmitter();
	@ViewChild('anchor', {static: true}) anchor: ElementRef<HTMLElement>;
	@ViewChild('inverseAnchor', {static: true}) inverseAnchor: ElementRef<HTMLElement>;

	private observer: IntersectionObserver;

	constructor(private host: ElementRef) { }

	get element() {
		return this.host.nativeElement;
	}

	ngOnInit() {
		const options = {
			root: this.getRoot(),
			...this.options
		};

		this.observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting){
				this.scrolled.emit();
			}
		}, options);

		this.inverseScroll ? this.observer.observe(this.inverseAnchor.nativeElement) : this.observer.observe(this.anchor.nativeElement);

	}

	private isHostScrollable() {
		const style = window.getComputedStyle(this.element);

		return style.getPropertyValue('overflow') === 'auto' ||
			style.getPropertyValue('overflow-y') === 'scroll';
	}

	getRoot() {
		switch (this.scrollRoot) {
			case 'host': return this.host.nativeElement;
			case 'parent': return this.host.nativeElement.parentNode;
			case 'window': return null;
			default:
				// element reference
				if (this.scrollRoot instanceof ElementRef) {
					return this.scrollRoot.nativeElement;
				}
				// HTML element
				if (this.scrollRoot) {
					return this.scrollRoot;
				}
				// self
				if (!this.scrollRoot && this.isHostScrollable()) {
					return this.host.nativeElement;
				}
				return null;
		}
	}

	ngOnDestroy() {
		this.observer.disconnect();
	}

}

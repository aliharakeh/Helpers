import { Directive, ElementRef, Input,  Renderer2 } from '@angular/core';

@Directive({
	selector: '[appSvgFrame]'
})
export class SvgFrameDirective {
	@Input()
	src: string;

	private cancelOnLoad: Function;
	private nativeElement: HTMLElement;
	constructor(private el: ElementRef, private renderer: Renderer2) {

	}

	ngAfterContentInit() {
		this.el.nativeElement.setAttribute('data', this.src);
		this.nativeElement = this.el.nativeElement;
		this.onError = this.onError.bind(this);
		this.onLoad = this.onLoad.bind(this);
		this.cancelOnLoad = this.renderer.listen(this.nativeElement, 'load', this.onLoad);
	}
	private onLoad() {
		this.removeOnLoadEvent();
		this.nativeElement.parentNode.replaceChild(this.el.nativeElement.contentDocument.documentElement.cloneNode(true), this.el.nativeElement);
	}
	private removeOnLoadEvent() {
		if (this.cancelOnLoad) {
			this.cancelOnLoad();
		}
	}
	ngOnDestroy() {
		this.removeOnLoadEvent();
	}
	private onError() {
		this.removeOnLoadEvent();
	}
}

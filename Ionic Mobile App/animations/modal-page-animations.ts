import {createAnimation} from '@ionic/angular';
import {Animation} from '@ionic/core';

export const modalPageEnterAnimation = (baseEl: HTMLElement): Animation => {

    const baseAnimation = createAnimation();
    const backdropAnimation = createAnimation();
    const wrapperAnimation = createAnimation();

    backdropAnimation.addElement(baseEl.querySelector('ion-backdrop'))
        .fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
        .beforeStyles({
            'pointer-events': 'none'
        })
        .afterClearStyles(['pointer-events']);

    wrapperAnimation.addElement(baseEl.querySelector('.modal-wrapper'))
        .keyframes([
            { offset: 0, opacity: 0.01, transform: 'translateX(100%)' },
            { offset: 1, opacity: 1, transform: 'translateX(0%)' }
        ]);

    return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(0.36,0.66,0.04,1)')
        .duration(400)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const modalPageLeaveAnimation = (baseEl: HTMLElement): Animation => {

    const baseAnimation = createAnimation();
    const backdropAnimation = createAnimation();
    const wrapperAnimation = createAnimation();
    const wrapperEl = baseEl.querySelector('.modal-wrapper');

    backdropAnimation
        .addElement(baseEl.querySelector('ion-backdrop'))
        .fromTo('opacity', 'var(--backdrop-opacity)', 0.0);

    wrapperAnimation
        .addElement(wrapperEl)
        .keyframes([
            { offset: 0, opacity: 1, transform: 'translateX(0%)' },
            { offset: 1, opacity: 1, transform: 'translateX(100%)' }
        ]);

    return baseAnimation
        .addElement(baseEl)
        .easing('cubic-bezier(0.47,0,0.745,0.715)')
        .duration(280)
        .addAnimation([backdropAnimation, wrapperAnimation]);

};

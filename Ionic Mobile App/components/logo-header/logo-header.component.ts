import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AuthenticationService} from '@app/shared/providers/authentication/authentication.service';
import {ThemeService} from '../../providers/appConfig/theme.service';

@Component({
    selector: 'app-logo-header',
    templateUrl: './logo-header.component.html',
    styleUrls: ['./logo-header.component.scss']
})
export class LogoHeaderComponent implements OnInit, OnDestroy {
    @Input() title = '';
    @Input() mode: 'logo-only' | 'title-only' | 'both' = 'both';
    public places = 0;
    public logoSrc = '';
    private logoSrcSub: Subscription;

    constructor(private theme: ThemeService, public auth: AuthenticationService) {
    }

    @Input() onSearchIconClick: () => void = () => {};

    ngOnInit() {
        this.logoSrcSub = this.theme.appLogo.pipe(
            tap(logo => {
                this.logoSrc = logo;
            })
        ).subscribe();
    }

    ngOnDestroy() {
        if (this.logoSrcSub) {
            this.logoSrcSub.unsubscribe();
        }
    }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

declare var $: any;

@Injectable()
export class AlertService {
    // public alert: Boolean;
    public alert = new Subject<Boolean>();
    public alertMessage: String;
    public alertType: String;
    public positiveCallback: any;
    public negativeCallback: any;

    constructor() {
        this.alert.next(false);
        this.alertMessage = '';
        this.alertType = '';

        this.negativeCallback = (() => {
            this.alert.next(false);
        });
    }

    show(alertType, alertText) {
        this.alertType = alertType;
        this.alertMessage = alertText;
        this.alert.next(true);
    }

    hide() {
        this.alert.next(false);
    }
}

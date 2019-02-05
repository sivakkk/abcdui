import { Injectable } from '@angular/core';

declare var $: any;

@Injectable()
export class LoaderService {
    public loadingText: String;
    public loading: Boolean;

    constructor() {
        this.loadingText = 'Loading... Please Wait';
        this.loading = false;
    }

    show(loadingText) {
        this.loadingText = loadingText;
        this.loading = true;
        var body = document.body, html = document.documentElement;

        var height = document.body.scrollHeight * 1.1;

        $('#loader').css('height', height + 'px');
    }

    hide() {
        this.loading = false;
    }
}

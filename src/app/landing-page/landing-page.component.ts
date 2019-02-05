import { Component, OnInit } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { LoaderService } from '../loader.service';
import { AppService } from '../app-service.service';
import { AlertService } from '../alert.service';
import { NotificationsService } from 'angular2-notifications';
import { Meta, Title } from '@angular/platform-browser';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
    data ={};

    name: String;
    email: String;
    mobile: String;
    subject: String;
    message: String;

    constructor(private _app : AppService, private _notify:NotificationsService, meta: Meta, titleService: Title ) {
        titleService.setTitle('OCLAVI | Object Classification and Annotation for Computer Vision Models');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited'},
            { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification, dicom annotation, medical ai, medical deep learning, cognitive computing, medical imagery, medical annotation' },
            { name: 'description', content: 'Our image annotation platform allows to classify images for machine learning, aritifical intelligence and nlp models in a collaborative way which solve the real world problems.' }
        ]);
    }
        
    ngOnInit() {
        $('.oc-main-image').addClass('animated fadeInRight');
    }

    save(name, email, mobile, subject, message) {
        this.data['name'] = name;
        this.data['email'] = email;
        this.data['mobile'] = mobile;
        this.data['subject'] = subject;
        this.data['message'] = message;

        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(email) == false) { 
            this._notify.error(null, 'Please enter name !');
        } else if(name == '') {
            this._notify.error(null, 'Please enter correct email address !');
        } else {
            this._app.connectUs(this.data).subscribe( (data) => {
                   this._notify.success(null,"Response save successfully !");
                   this._notify.success(null, "We will connect to you soon.");
            }, (err) => {
                this._notify.error(null,"Network error !");
            })
        }
    }

}

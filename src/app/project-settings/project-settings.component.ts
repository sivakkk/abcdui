import { Component, OnInit, Input, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProjectService } from '../project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Http, RequestOptions } from '@angular/http';
import { NotificationsService } from 'angular2-notifications';
import { LoaderService } from '../loader.service';

declare var $: any;
declare var Razorpay: any;

@Component({
    selector: 'app-project-settings',
    templateUrl: './project-settings.component.html',
    styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent implements OnInit, OnDestroy {
    projectID;
    projectIDSubscription;
    user;
    settingsTab: string;
    environment: any;
    billingAmount: any;
    imgCountsSubscription:any;
    imgCounts:any;
    disableStartBtn = true;
    httpOptions:RequestOptions;
    step1: any;
    step2: any;
    step3: any;
    activeAccordion:string;

    constructor(private projectService: ProjectService, private route: ActivatedRoute, private router: Router,
        meta: Meta, titleService: Title, private http: Http, private notify: NotificationsService,
        private loadingService: LoaderService, private ngZone: NgZone) {

        titleService.setTitle('Project Settings | OCLAVI');
        meta.addTags([
            { name: 'author', content: 'Carabiner Technologies Private Limited' }
        ]);

        this.environment = environment;
    }

    ngOnInit() {
        this.projectIDSubscription = this.route.params.subscribe(params => {
            this.projectID = params.id;
            this.projectService.currentProject = params.id;
        });

        this.settingsTab = this.router.url.slice(this.router.url.lastIndexOf('/') + 1);
        this.user = JSON.parse(localStorage.getItem('user'));
        this.httpOptions = new RequestOptions({ withCredentials: true });

        // Checking if project has to annotated by freelancer and project owner has classified necessary amount of images for training
        if (this.projectID && this.user.PROJECTS[this.projectID].ANNOTATE_BY === environment.USER_TYPE.FREELANCER.NAME) {
            this.imgCountsSubscription = this.projectService.imgCountsForCurrentProject.subscribe((counts: any) => {
                this.imgCounts = counts;

                if (counts.totalImages !== 0) {
                    const percentageImagesClassified = Math.ceil((counts.classifiedImages / counts.totalImages) * 100);

                    if (percentageImagesClassified >= this.projectService.getClassifyImageLimit(counts.totalImages)) {
                        this.disableStartBtn = false;
                    }
                }
            });
        }

        this.step1 = {
            step: 1,
            title: 'shape_details',
            ownerEstimates: [
                { name: 'rectangles', num: 0 },
                { name: 'polygons', num: 0 },
                { name: 'circles', num: 0 },
                { name: 'points', num: 0 },
                { name: 'cuboids', num: 0 }
            ],
            content: ``,
            class: '',	// Pass as 'show' for the active step
            status: 'inactive'
        };

        this.step2 = {
            step: 2,
            title: 'freelancer_payment',
            content: `Payments Section`,
            class: '',
            ownerEstimates: {},
            status: 'inactive',
            methods: [{
              name: 'razorpay',
              description: 'For Indian Credit / Debit Cards'
            }, {
              name: 'paypal',
              description: 'For international cards'
            }],
            location: '',
            selectedMethod: 'razorpay'
        };
    }

    changeSettingsTab(tab) {
        this.settingsTab = tab;
    }

    // Only available if project has to be annotated by freelancer
    classify() {
        this.loadingService.show('Please wait...');

        if (this.imgCounts && this.imgCounts.totalImages !== 0 && this.disableStartBtn) {
            this.http.post(environment.oclaviServer + 'classify', { projectId: this.projectID }, this.httpOptions)
                .subscribe(res => {
                    this.loadingService.hide();

                    this.router.navigate([res.json().redirect]);
                }, err => {
                    this.errorHandler(err, 'Some unexpected error has occured.');
                });
        }
    }

    // Only if project has to be annotated by freelancer
    sendAcceptProjectLink() {
        if (!this.disableStartBtn && this.user.PROJECTS[this.projectID].ANNOTATE_BY === environment.USER_TYPE.FREELANCER.NAME) {
            this.loadingService.show('Sending Invitation to freelancers');

            this.projectService.sendAcceptProjectLinktoFreelancers(this.projectID)
                .subscribe(res => {
                    this.disableStartBtn = true;
                    this.loadingService.hide();
                    this.notify.success('Invitation sent to freelancers');
                }, err => this.errorHandler(err, 'Some unexpected error has occured.'));
        }
    }

    openModal(id) {
        for (let i = 1; i < 3; i++) {
            if (i === 1) {
                this['step' + i].status = 'active';
                this['step' + i].class = 'show';
                this.activeAccordion = this['step' + i].title.replace(/_/g, ' ');
            } else {
                this['step' + i].status = 'inactive';
                this['step' + i].class = '';
            }
        }
        $('#' + id).modal(open);
    }

    payNow(vm, paymentMethod, projectId, ownerEstimates) {
        $('#freelancerProjectPay').modal('hide');

        if (paymentMethod == 'paypal')
            vm.paypalCheckout(vm, ownerEstimates);

        else if (paymentMethod == 'razorpay')
            vm.razorpayCheckout(vm, projectId, ownerEstimates);
    }

    razorpayCheckout(vm, projectId, ownerEstimates) {
        vm.http.post(environment.oclaviServer + 'razorpay/getModalData', { type: 'freelancer', ownerEstimates, projectId }, vm.httpOptions).subscribe(res => {
            vm.loadingService.hide();
            let data = res.json();

            if(data.AMOUNT < 100)
              data.AMOUNT = 100;

            var options = {
                key: data.KEY,
                name: data.MERCHANT_NAME,
                amount: data.AMOUNT,
                description: data.DESCRIPTION,
                image: '../../assets/images/Oclavi_Logo@2x.png',
                prefill: {
                    name: data.EMAIL_ID,
                    email: data.EMAIL_ID
                },
                theme: {
                    color: '#3D78E0'
                },
                handler: (response) => {
                    vm.ngZone.run(() => {
                        data.PAYMENT_ID = response.razorpay_payment_id;
                        data.PAYMENT_SOURCE = 'RAZOR_PAY';
                        data.PROJECT_ID = vm.projectID;
                        data.OWNER_ESTIMATES = ownerEstimates;

                        vm.http.post(environment.oclaviServer + 'freelancerPayment', data, vm.httpOptions).subscribe(res => {
                            vm.router.navigate(['/payment-status/razorpay/success/freelancer'], {
                                queryParams: {
                                    razorpay_payment_id: response.razorpay_payment_id
                                }
                            });
                        });
                    });
                }
            }

            var razorpay = new Razorpay(options);
            razorpay.open();
        }, err => {
            vm.errorHandler(err, 'Error making freelancer payment...');
        });
    }

    paypalCheckout(vm, ownerEstimates) {
        vm.loadingService.show('Creating your paypal transaction...');
        let data = {
          PROJECT_ID: vm.projectID,
          PAYMENT_SOURCE: 'PAYPAL',
          OWNER_ESTIMATES: ownerEstimates
        }

        vm.http.post(environment.oclaviServer + 'freelancerPayment', data, vm.httpOptions).subscribe(res => {
            vm.loadingService.show('Redirecting to payment page...');

            var body = res.json();

            window.location.href = body.approval_url;
        }, err => {
            vm.errorHandler(err, 'Error while making freelancer payment...');
        });
    }

    async changeStep(event: { currentStep: any, direction: string }) {  // Direction: Next step or Prev step
        if (event.direction === 'next') {
            const next = event.currentStep.step + 1;

            if (event.currentStep.step === 1) {
                this.notify.info(null, 'Please wait while we fetch data');

                const images = this.imgCounts.totalImages - this.imgCounts.classifiedImages;
                /*********************Uncomment below code when calculating projectCost part is completed ********/
                try {
                    const shapes = {};
                    this.step1.ownerEstimates.forEach(shape => shapes[shape.name.substr(0, shape.name.length - 1).toUpperCase()] = shape.num);
                    const data = {
                      projectId: this.projectID,
                      type: 'freelancer',
                      ownerEstimates: shapes
                    };

                    this.step2.ownerEstimates = data.ownerEstimates;
                    this.step2.projectId = data.projectId;
                    this.billingAmount = await this.projectService.getFreelancerProjectCost(data).toPromise();

                    console.log(this.billingAmount);

                    // const location: any = await this.http.get('https://ipapi.co/json').toPromise();
                    // this.step2.location = location.json().country;
                    //
                    // if (location.json().country !== 'IN') {
                    //     this.step2.methods = ['paypal'];
                    //     this.step2.selectedMethod = 'paypal';
                    // }
                } catch (err) {
                    console.log(err)
                    this.errorHandler(err, 'Error occured while fetching data');
                    return;
                }
            }

            this['step' + event.currentStep.step].status = 'completed';
            this['step' + event.currentStep.step].class = '';

            if (this['step' + next]) {
                this['step' + next].status = 'active';
                this['step' + next].class = 'show';
                this.activeAccordion = this['step' + next].title.replace(/_/g, ' ');
            }
        }

        else if (event.direction === 'prev') {
            const prev = event.currentStep.step - 1;

            this['step' + event.currentStep.step].status = 'inactive';
            this['step' + event.currentStep.step].class = '';

            if (this['step' + prev]) {
                this['step' + prev].status = 'active';
                this['step' + prev].class = 'show';
                this.activeAccordion = this['step' + prev].title.replace(/_/g, ' ');
            }
        }
    }


    ngOnDestroy() {
        this.projectIDSubscription.unsubscribe();

        if (this.projectID && this.user.PROJECTS[this.projectID].ANNOTATE_BY === environment.USER_TYPE.FREELANCER.NAME) {
            this.imgCountsSubscription.unsubscribe();
        }
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.json().message;

            if (text && text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
    }
}

import { Component, OnInit, Input, ViewEncapsulation, NgZone, Output, EventEmitter } from '@angular/core';
import { Http, Response, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app-service.service';
import { LoggerService } from '../logger.service';
import { LoaderService } from '../loader.service';
import { ConfirmPasswordService } from '../confirm-password.service';
import { environment } from '../../environments/environment';
import { AlertService } from '../alert.service';
import { NotificationsService } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../project.service';

declare var io: any;
declare var Razorpay: any;
declare var ProductTour: any;
declare var setTimeout: any;
declare var $: any;
declare var oauthWindow;
declare var gapi: any;
declare var google: any;

@Component({
    selector: 'app-image-settings',
    templateUrl: './image-settings.component.html',
    styleUrls: ['./image-settings.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ImageSettingsComponent implements OnInit {
    // @Input() tab: string;
    // @Input() user;
    user;
    @Output() planTypeUpdated: EventEmitter<any> = new EventEmitter();
    projectId;   // We get this id from ProjectService

    objectStorageData = {};
    httpOptions: RequestOptions;
    defaultStorage: String;
    progress: Number;
    progressText: String;
    synchronizerRunning: Boolean;
    settings: any;
    session: any;
    socket: any;
    export: any;
    showModal = false;
    dataAvaiable = false;
    environment:any;
    toBeDeletedOn:any;
    exportColumns = [
        {
            name: 'Classified By',
            disable: false,
            value: true
        },
        {
            name: 'Label Category',
            disable: false,
            value: true
        },
        {
            name: 'Bucket Name',
            disable: false,
            value: true
        },
        {
            name: 'Label Name',
            disable: true,
            value: true
        },
        {
            name: 'Image Name',
            disable: true,
            value: true
        },
        {
            name: 'Start X',
            disable: true,
            value: true
        },
        {
            name: 'Start Y',
            disable: true,
            value: true
        },
        {
            name: 'Width',
            disable: true,
            value: true
        },
        {
            name: 'Height',
            disable: true,
            value: true
        }
    ];

    activeStorage = 'S3';
    imageSettingsDataModel = {};
    currentStatus: any;
    prevAzureStorage: any;
    readonly STATUS_INITIAL = 0;
    readonly STATUS_SAVING = 1;
    readonly STATUS_SUCCESS = 2;
    readonly STATUS_FAILED = 3;
    // For Google drive file picker API
    oAuthToken: null;
    pickerApiLoaded = false;
    picker: any;
    expiresAt: any;
    phone_number: any;
    countryCode: any;  // For phone number modal

    constructor(private http: Http, private router: Router, private route: ActivatedRoute, private appService: AppService,
        private loadingService: LoaderService, private confirmPasswordService: ConfirmPasswordService, private notify: NotificationsService,
        private alertService: AlertService, private loggerService: LoggerService, private _ngZone: NgZone, private titleService: Title,
        private projectService: ProjectService) {

        this.progress = 0;
        this.synchronizerRunning = false;
        this.progressText = 'There is no progress to show.';
        this.export = {};
        this.environment = environment;

        this.export = {
            classifiedBy: true,
            labelCategory: true,
            bucketName: true
        };
        this.defaultStorage = 'S3';
        this.socket = appService.getSocket();
    }

    ngOnInit() {
        // Get project ID
        this.projectId = this.projectService.currentProject;

        this.titleService.setTitle('Image Settings | OCLAVI');

        this.loadingService.show('Fetching Details...');

        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.http.get(environment.oclaviServer + 'image-settings.json', this.httpOptions).subscribe(res => {
            var data = res.json();

            this.objectStorageData = data.STORAGE_TYPES;

        }, err => {
            this.errorHandler(err, 'Error getting image settings.');
        });

        this.http.get(environment.oclaviServer + 'imageSettings?projectId=' + this.projectId, this.httpOptions).subscribe(res => {
            this.loggerService.log(res);
            var data = res.json();
            this.imageSettingsDataModel = data;

            this.activeStorage = data.activeStorage;
            this.dataAvaiable = true;

            if(this.activeStorage == 'AZURE_STORAGE')
                this.prevAzureStorage = this.imageSettingsDataModel['storage'].AZURE_STORAGE.AZURE_STORAGE_TYPE;

            this.loadingService.hide();

            this.projectService.imgCountsForCurrentProject.next(data);
        }, err => {
            this.errorHandler(err, 'Error getting image settings.');
        });

        this.session = JSON.parse(localStorage.getItem('user'));
        this.user = this.session;

        if (this.user.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE && this.user.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE.tokens) {
            this.oAuthToken = this.user.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE.tokens.access_token;
            this.expiresAt = this.user.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE.tokens.expiry_date;
        }

        this.socket.on('logout', (data) => {
            this.http.get(environment.oclaviServer + 'logout', this.httpOptions).subscribe(res => {
                this.router.navigate(['login']);
            }, err => {
                this.errorHandler(err, 'Error while logging out the user.');
            });
        });

        gapi.load('picker');      // Load Google drive file Picker API
    }

    startSynchonizer(type = 'basic') {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            this.synchronizerRunning = true;

            if (this.user.SUBSCRIPTION_FLAG.LIMITS.IMAGE_LIMIT != -1 && this.user.SUBSCRIPTION_FLAG.LIMITS.IMAGE_LIMIT <= this.imageSettingsDataModel['totalImages']) {
                this.notify.info(null, "you have exceed image classication limit, Please upgrade you account");
                return;
            }


            this.http.get(environment.oclaviServer + 'synchronizer/' + type + '?projectId=' + this.projectId, this.httpOptions)
                .subscribe(res => {
                    this.notify.success('Your synchronization request has been submitted...');

                    this.socket.on('progressText', (data) => {
                        this.progressText = data;
                        this.progress = 0;
                    });

                    this.socket.on('progress', (data) => {
                        var data = JSON.parse(data);

                        this.progress = Math.round(data.completed);
                        this.progressText = '';
                    });

                    this.socket.on('lastSynchronizationDate', (data) => {
                        this.session.PROJECTS[this.projectId].LAST_SYNCHRONIZATION_DATE = data;
                        this.progressText = 'There is no progress to show.';
                        this.progress = 0;
                        this.synchronizerRunning = false;

                        this.updateLocalStorageSessionData();
                    });


                    this.socket.on('totalCount', (data) => {
                        if (data != undefined) {
                            this.imageSettingsDataModel['totalImages'] = data;
                            this.session.PROJECTS[this.projectId].TOTAL_IMAGES = data;
                            this.projectService.imgCountsForCurrentProject.next({ totalImages: data, classifiedImages: this.imageSettingsDataModel['classifiedImages'] });

                            this.updateLocalStorageSessionData();
                        }
                    });

                    this.socket.on('basicSync', (data) => {
                        this.alertService.show('info', data);

                        this.alertService.positiveCallback = (() => {
                            this.alertService.hide();

                            this.loadingService.show('Upgrading your current subscription...');

                            this.httpOptions = new RequestOptions({ withCredentials: true });

                            this.http.post(environment.oclaviServer + 'upgradePlan', {}, this.httpOptions).subscribe(res => {

                                var body = res.json();

                                var options = {
                                    key: body.key,
                                    subscription_id: body.subscriptionId,
                                    name: body.merchantName,
                                    description: body.description,
                                    image: '../assets/images/Oclavi_Logo@2x.png',
                                    handler: (response) => {
                                        this._ngZone.run(() => {
                                            this.loadingService.show('Verifying the transaction...');

                                            var body = {
                                                razorpayPaymentId: response.razorpay_payment_id,
                                                razorpaySignature: response.razorpay_signature,
                                                razorpaySubscriptionId: response.razorpay_subscription_id,
                                                email: this.session.EMAIL_ID
                                            }

                                            this.http.post(environment.oclaviServer + 'upgradePlanVerifyPayment', body, this.httpOptions).subscribe(res => {
                                                this.loadingService.hide();

                                                if (this.session.USER_TYPE == environment.USER_TYPE.STUDENT_ADMIN.NAME) {
                                                    this.session.USER_TYPE = environment.USER_TYPE.ADMIN.NAME;

                                                    this.notify.success('Your subscription has been updated to Admin Plan.');
                                                }

                                                else if (this.session.USER_TYPE == environment.USER_TYPE.STUDENT_SELF.NAME) {
                                                    this.session.USER_TYPE = environment.USER_TYPE.SELF.NAME;

                                                    this.notify.success('Your subscription has been updated to Self Plan.');
                                                }

                                                this.planTypeUpdated.emit(this.session.USER_TYPE);

                                                this.updateLocalStorageSessionData();
                                            }, err => {
                                                this.loadingService.hide();

                                                this.notify.error('Error while verifying four payment.');
                                                this.loggerService.log(err);
                                            });
                                        });
                                    },
                                    prefill: {
                                        name: body.name,
                                        email: body.email
                                    },
                                    theme: {
                                        color: '#3D78E0'
                                    }
                                };

                                var razorpay = new Razorpay(options);
                                razorpay.open();


                            }, err => {
                                this.errorHandler(err, 'Error while running the synchronizer.');
                            });
                        });


                        this.alertService.negativeCallback = (() => {
                            this.alertService.hide();
                            this.startSynchonizer('advance');
                        });
                    });

                }, err => {

                    this.progressText = 'Authentication Failure';
                    this.progress = 0;

                    this.synchronizerRunning = false;

                    var text = JSON.parse(err._body).message;
                    // this.notify.info(null, text);

                    this.errorHandler(err, 'Authentication Failure');
                });
        }
    }

    showApiExportInfo() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            let exportUrl = environment.oclaviServer + 'apiexport?email=' + this.session.EMAIL_ID + '&projectId=' + this.projectId + '&token=' + this.session.PROJECTS[this.projectId].EXPORT_TOKEN + '&activeStorage=' + this.activeStorage;

            let element = 'Your export url is<a href="' + exportUrl + '" target="_blank"> here</a>'
                + '<br /><br /> This url doesn\'t need authentication, so keep the export token safe. You can regenerate the token if you feel it has been misused.';

            this.alertService.show('info', element);

            this.alertService.positiveCallback = (() => {
                this.alertService.hide();
            });
        }
    }

    updateLocalStorageSessionData() {
        localStorage.setItem('user', JSON.stringify(this.session));
    }

    errorHandler(response, message) {
        //general purpose error handler
        this.loadingService.hide();

        if (response.status == 401)
            this.router.navigate(['login']);

        else if (Object.keys(response).length > 0) {
            var text = response.json().message;

            if (text != '')
                this.notify.error(null, text);

            else
                this.notify.error(null, message);
        }

        else
            this.notify.error(null, message);
    }

    regenerateExportToken() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            this.loadingService.show('Regenerating a new Export Token...');
            this.http.post(environment.oclaviServer + 'regenerateExportToken', { projectId: this.projectId }, this.httpOptions).subscribe(res => {
                this.loadingService.hide();

                this.session.PROJECTS[this.projectId].EXPORT_TOKEN = res.json().EXPORT_TOKEN;

                this.updateLocalStorageSessionData();
            }, err => {
                this.errorHandler(err, 'Error while regenerating export token.');
            });
        }
    }

    openModal(id) {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            if (id === 'phone-number-modal') {
                this.http.get('https://ipapi.co/json')
                    .subscribe(res => this.countryCode = res.json().country.toLowerCase(),
                        err => this.countryCode = 'us');
            }
            $('#' + id).modal('show');
        }
    }

    closeModal(id) {
        // this.showModal = false;
        $('#' + id).modal('hide');
        if (id === 'phone-number-modal') {
            this.startSynchonizer();
        }
    }

    startExport() {
        $('#export-modal').modal('hide');
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            var exportData = {
                exportColumns: this.exportColumns
            }
            this.notify.info('Exporting data, please wait...');
            this.http.post(environment.oclaviServer + 'export', { exportData: exportData, projectId: this.projectId, activeStorage: this.activeStorage }, this.httpOptions)
                .subscribe((data) => {
                    let headers = new Headers();
                    var options = new RequestOptions({ withCredentials: true, headers: headers, responseType: ResponseContentType.Blob });

                    var filename = 'export.csv';
                    var blob = new Blob([data['_body']], {
                        type: 'application/vnd.ms-excel'
                    });

                    if (typeof window.navigator.msSaveBlob !== 'undefined')
                        window.navigator.msSaveBlob(blob, filename);

                    else {
                        var URL = window.URL || window['webkitURL'];
                        var downloadUrl = URL.createObjectURL(blob);

                        var a = document.createElement("a");

                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined')
                            window.open = downloadUrl;

                        else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);

                            a.click();
                        }

                        setTimeout(function() {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100); // cleanup
                    }
                }, (err) => {
                    this.errorHandler(err, 'Error occured while exporting data');
                });
        }
    }

    blueEvent(e) {
        console.log(e);
        return false;
    }

    saveDetails() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            var activeStorageSchema = this.objectStorageData[this.activeStorage];
            var activeStorageData = this.imageSettingsDataModel['storage'][this.activeStorage];

            if (this.prevAzureStorage && this.prevAzureStorage != '' && this.imageSettingsDataModel['storage'].AZURE_STORAGE.AZURE_STORAGE_TYPE != this.prevAzureStorage) {
                this.alertService.show('error', 'You can\'t change the azure storage type once selected. However you can create a new project with the different Azure Storage type.');
                this.prevAzureStorage = this.imageSettingsDataModel['storage'].AZURE_STORAGE.AZURE_STORAGE_TYPE;
                return;
            }

            this.alertService.show('warn', 'Do you want to save your changes?');

            this.alertService.positiveCallback = (() => {
                this.alertService.hide();
                this.saveStorageData(activeStorageData);
            });
        }
    }

    saveStorageData(dStorageValues) {
        var data = {
            activeStorage: this.activeStorage,
            storage: dStorageValues,
            projectId: this.projectId
        };

        this.loadingService.show('saving Details...');

        this.httpOptions = new RequestOptions({ withCredentials: true });

        this.http.post(environment.oclaviServer + 'imageSettings/update', data, this.httpOptions).subscribe(res => {
            this.loadingService.hide();
            this.notify.success(null, "Setting saved successfully");

        }, err => {
            let errorMessage = err.json().message;

            this.loadingService.hide();
            this.errorHandler(err, 'Error while saving the storage details.');
        });
    }

    // initTour() {

    //     var productTour = new ProductTour({
    //         overlay: true,
    //         onStart: function() { },
    //         onChanged: function(e) { },
    //         onClosed: (e) => {
    //             this.appService.setCookies('oclavi-image-tour', 1);
    //         }
    //     });

    //     productTour.steps([
    //         // {
    //         //     element: '.buckets',
    //         //     title: 'Cloud Storage Provider',
    //         //     content: 'Pick the storage provide where your images are available for classification',
    //         //     position: 'top'
    //         // },
    //         // {
    //         //     element: '.ACCESS_KEY',
    //         //     title: 'Cloud Storage Access Key',
    //         //     content: 'Provide the access key for the cloud storage',
    //         //     position: 'top'
    //         // },
    //         // {
    //         //     element: '.SECRET_KEY',
    //         //     title: 'Cloud Storage Secret Key',
    //         //     content: 'Provide the secret key for the cloud storage',
    //         //     position: 'top'
    //         // },
    //         {
    //             element: '.synchronizerButton',
    //             title: 'Synchronizer',
    //             content: 'Click here to synchronize the image details for classification',
    //             position: 'top'
    //         },
    //         {
    //             element: '.exportButton',
    //             title: 'Export',
    //             content: 'Export the classified data in csv',
    //             position: 'top'
    //         }
    //     ]);

    //     productTour.startTour();

    // }


    connectDropbox() {
        if (!this.session.SUBSCRIPTION_FLAG.STORAGE.DROPBOX)
            this.alertService.show('error', 'You don\'t have access to this storage type');

        else {
            this.loadingService.show('Fetching Details...');
            this.http.get(environment.oclaviServer + 'dropbox/auth', this.httpOptions).subscribe(res => {
                this.loadingService.hide();
                var body = res.json();
                var redirectURI = body.redirectURI;
                oauthWindow = window.open(body.url);

                oauthWindow.document.onload = function(e) {

                    if (oauthWindow.location.href.indexOf('oauth2/authorize') > -1) {
                        return;
                    }

                    if (oauthWindow.location.href.indexOf(redirectURI) > -1) {
                        oauthWindow.close();

                    }
                }
            }, err => {
                this.loadingService.hide();
                this.notify.error(null, "Please try again");
                this.errorHandler(err, 'Error while connecting the dropbox.');
            });
        }
    }

    connectGoogleDrive() {
        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            if (!this.session.SUBSCRIPTION_FLAG.STORAGE.GOOGLE_DRIVE)
                this.alertService.show('error', 'You don\'t have access to this storage type');

            else {
                this.loadingService.show('Fetching Details...');

                // Added ProjecId in below request url as query param
                this.http.get(environment.oclaviServer + 'gdrive/auth' + '?projectId=' + this.projectId, this.httpOptions).subscribe((res: any) => {
                    this.loadingService.hide();
                    var redirectURI = res._body;
                    let oauthWindow = window.open(redirectURI, '_self');
                }, err => {
                    this.loadingService.hide();
                    this.notify.error(null, "Please try again");
                    this.errorHandler(err, 'Error while connecting the google drive.');
                });
            }
        }
    }

    disconnectGoogleDrive() {
        this.loadingService.show('Disconnecting your google drive...');

        // Added ProjecId in below request url as query param
        this.http.post(environment.oclaviServer + 'gdrive/disconnect', { projectId: this.projectId }, this.httpOptions).subscribe((res: any) => {
            this.loadingService.hide();
            this.notify.success('Your google drive has been disconnected successfully.');

            delete this.session.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE;

            this.updateLocalStorageSessionData();
        }, err => {
            this.loadingService.hide();
            this.notify.error(null, "Please try again");
            this.errorHandler(err, 'Error while disconnecting the google drive.');
        });
    }

    onPickerApiLoad() {
        this.pickerApiLoaded = true;

        if (!this.picker)
            this.createPicker();

        this.picker.setVisible(true);
    }

    // Load Google drive file Picker API
    loadPicker() {
        this.loadingService.show('Adding folder, please wait...');

        if (this.user.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {

            if (this.expiresAt < new Date().getTime()) {
                this.notify.info(null, 'Please wait...');

                this.http.post(environment.oclaviServer + 'gdrive/checkToken', { projectId: this.projectId }, this.httpOptions)
                    .subscribe(response => {
                        const res = response.json();
                        this.user.PROJECTS[this.projectId].STORAGE_DETAILS.GOOGLE_DRIVE.tokens = res.tokens;
                        this.updateLocalStorageSessionData();

                        this.oAuthToken = res.tokens.access_token;
                        this.expiresAt = res.tokens.expiry_date;
                        this.onPickerApiLoad.call(this);
                    }, err => {
                        this.notify.error(null, 'Please try again');
                        console.log(err);
                    });

            } else {
                this.onPickerApiLoad.call(this);
            }
        }
    }

    // Create Picker
    createPicker() {
        if (this.pickerApiLoaded && this.oAuthToken) {
            const view = new google.picker.DocsView()
                .setIncludeFolders(true)
                .setMimeTypes('application/vnd.google-apps.folder')
                .setSelectFolderEnabled(true);

            this.picker = new google.picker.PickerBuilder()
                .addView(view)
                .setOAuthToken(this.oAuthToken)
                .setCallback(this.pickerCallback.bind(this))
                .build();
        }
    }

    // Get folderId
    pickerCallback(data) {
        if (data.action == google.picker.Action.PICKED) {
            const id = data.docs[0].id;    // Selected folder's ID
            const name = data.docs[0].name;  // Selected folder's NAME
            this.picker.setVisible(false);
            this.picker.dispose();

            if (this.isFolderExist(id)) {
                this.alertService.show('warn', `${name} folder already exist in another Project, Do you still want to add it in this project?`);

                this.alertService.positiveCallback = (() => {
                    this.alertService.hide();
                    this.saveFolder(id, name);
                });
            } else {
                this.saveFolder(id, name);
            }
        } else if (data.action == google.picker.Action.CANCEL) {
            this.loadingService.hide();
            this.picker.setVisible(false);
        }
    }

    isFolderExist(folderId) {
        // Check if folder(selected from file picker) already exists in other Project

        for (let key in this.user.PROJECTS) {
            if (this.user.PROJECTS[key].STORAGE_DETAILS.GOOGLE_DRIVE &&
                folderId === this.user.PROJECTS[key].STORAGE_DETAILS.GOOGLE_DRIVE.FOLDER_ID) {
                return true;
            }
        }
        return false;
    }

    deleteProject() {
        if (this.session.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            this.httpOptions = new RequestOptions({ withCredentials: true });
            let body = {
                projectId: this.projectId
            }

            this.http.post(environment.oclaviServer + 'project/deleteProject', body, this.httpOptions).subscribe(res => {
                this.notify.success('Your project has been scheduled for deletion.');
                this.session.PROJECTS[this.projectId].STATUS = 'TO_BE_DELETED';

                this.toBeDeletedOn = res.json().toBeDeletedOn;

                this.updateLocalStorageSessionData();
            }, err => {
                this.errorHandler(err, 'Error scheduling your project for deletion.');
            });
        }
    }

    cancelDeletion() {
        if (this.session.USER_TYPE != environment.USER_TYPE.TEAM.NAME) {
            this.httpOptions = new RequestOptions({ withCredentials: true });
            let body = {
                projectId: this.projectId
            }

            this.http.post(environment.oclaviServer + 'project/cancelDeletion', body, this.httpOptions).subscribe(res => {
                this.notify.success('Your project deletion has been cancelled.');
                this.session.PROJECTS[this.projectId].STATUS = 'ACTIVE';
                this.updateLocalStorageSessionData();
            }, err => {
                this.errorHandler(err, 'Error cancelling your project deletion.');
            });
        }
    }

    confirmPassword() {
        this.confirmPasswordService.show(this.deleteProject.bind(this));
    }

    // Save Folder
    saveFolder(id, name) {
        this.currentStatus = this.STATUS_SAVING;
        this.projectService.selectProjectFolder({ projectId: this.projectId, folderDetails: { ID: id, NAME: name } })
            .subscribe(response => {
                this.user.PROJECTS = response.PROJECTS;
                this.loadingService.hide();
                this.notify.success('Folder added to project.');
                this.currentStatus = this.STATUS_SUCCESS;
                this.updateLocalStorageSessionData();
            }, err => {
                this.currentStatus = this.STATUS_FAILED;

                this.errorHandler(err, 'Error saving the folder');
            });
    }

    savePhoneNumber() {
        $('#phone-number-modal').modal('hide');

        if (this.phone_number == undefined || this.phone_number == '' || this.phone_number.toString().length < 11 || this.phone_number.toString().length > 16) {
            this.notify.error(null, 'Please enter a valid phone number!');
        }
        else {

            this.http.post(environment.oclaviServer + 'savePhoneNumber', { phone_number: this.phone_number }, this.httpOptions)
                .subscribe(res => {
                    this.notify.success(null, 'Phone number saved successfully.');
                    this.user.PHONE_NUMBER = this.phone_number;
                    this.updateLocalStorageSessionData();
                }, err => {
                    this.errorHandler(err, 'Error saving your phone number.');
                });
        }

        this.startSynchonizer();
    }
}

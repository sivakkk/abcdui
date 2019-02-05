  import { Component, OnInit } from '@angular/core';
  import { Title } from '@angular/platform-browser';
  import { Http, RequestOptions } from '@angular/http';
  import { Subject } from 'rxjs/Subject';
  import { ProjectService } from '../project.service';
  import { environment } from '../../environments/environment';
  import { NotificationsService } from 'angular2-notifications';
  import { AlertService } from '../alert.service';
  import { LoaderService } from '../loader.service';
  import { Circle } from '../classify/circle';
  import { Rectangle } from '../classify/rectangle';
  import { Polygon } from '../classify/polygon';
  import { Point } from '../classify/point';
  import { Cuboid } from '../classify/cuboid';
  import 'rxjs/add/operator/map';
  import 'rxjs/add/operator/debounceTime';
  import 'rxjs/add/operator/distinctUntilChanged';
  import 'rxjs/add/observable/of';
  import { Router } from '@angular/router';

  declare var $: any;

  @Component({
    selector: 'app-view-image',
    templateUrl: './view-image.component.html',
    styleUrls: ['./view-image.component.scss']
  })
  export class ViewImageComponent implements OnInit {

    projectId;
    user;
    bucketName = '';     // This will need only if Active storage for current project is S3
    environment;
    sortingMethod: string;
    searchTerm = new Subject<String>();
    searchFor;
    options = new RequestOptions({ withCredentials: true });
    filtersApplied: number;
    filterList = [{ name: 'Classified Images', isEnabled: false, status: 'CLASSIFIED' },
                  { name: 'Non - classified Images', isEnabled: false, status: 'NEW' },
                  { name: 'In Progress', isEnabled: false, status: 'ASSIGNED' }];
    images = [];
    noImagesLeft: Boolean = false;  // Field prevents any unnecessary requests to backend
    fetchingInProcess: Boolean = false; // For showing loading screen
    unlockingImage: Boolean = false;  // For disabling unlock button if unlocking is already in progress 
    imagesLimit: number;  // Number of images to fetch in one request
    filtersAppliedList = [];  // Filters for getting images. e.g. 'NEW', 'CLASSIFIED'
    currentImage: number; // Will be used when showing image in modal
    canvasHeight;
    canvasWidth;
    imgThumbnailHeight;
    imgThumbnailWidth;
    canvas;
    canvas2;
    canvasImage;
    ctx;
    ctxImg;
    shapes = [];
    labels = [];
    imageThumbnails = [];
    currentImageData = {};
    WIDTH;  // Width of selected image in modal
    HEIGHT;  // Height of selected image in modal

    constructor(private projectService: ProjectService, private titleService: Title, private http: Http,
                private notify: NotificationsService, private alertService: AlertService,
                private loadingService: LoaderService, private router: Router) {
      this.environment = environment;

      // Used when user tries to fetch image by imgae name
      const searched = this.searchTerm.debounceTime(600)
                    .distinctUntilChanged()
                    .map(term => {
                      if (term.length >= 3) {
                        this.searchFor = term;
                        this.noImagesLeft = false;
                        this.images = [];
                        this.getImages();
                        return term;
                      }
                    }).subscribe( () => {
                      this.currentImage = null;
                    }, err => console.log(err));

    }


    ngOnInit() {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.projectId = this.projectService.currentProject;
      this.titleService.setTitle( 'View Image - OCLAVI' );
      // Initalizing fields
      this.sortingMethod = 'None';
      this.filtersApplied = 0;
      this.imagesLimit = 10;

      // If project storage is 'S3', get bucket name
      if (this.user.PROJECTS[this.projectId].STORAGE_DETAILS.S3 && this.user.PROJECTS[this.projectId].STORAGE_DETAILS.S3.BUCKET_NAME) {
        this.bucketName = this.user.PROJECTS[this.projectId].STORAGE_DETAILS.S3.BUCKET_NAME;
      }

      // Set Number of images to fetch in one request according to screen size
      if (this.user.PROJECTS[this.projectId].TOTAL_IMAGES !== 0) {
        const innerHeight = screen.height;
        const innerWidth = screen.width;
        if (innerWidth > 1920 && innerHeight > 1080) {
          this.imagesLimit = 20;
        } else if (innerWidth >= 1024 && innerWidth <= 1920 && innerHeight >= 998 && innerHeight <= 1366) {
          this.imagesLimit = 16;
        } else if (innerWidth >= 1366 && innerWidth <= 1600 && innerHeight >= 768 && innerHeight <= 900) {
          this.imagesLimit = 12;
        }

        this.getImages();

        // Prevent closing of dropdown when clicked on filter options
        $('#filter-list').on('click', function (event) {
          event.stopPropagation();
        });

        // Close dropdown
        $('#filter-list .close').on('click', function (event) {
          $(this).parent().removeClass('show');
        });

        this.canvasHeight = window.innerHeight * 0.65;
        this.canvasWidth = (window.innerWidth * 0.75) - 30;
        this.imgThumbnailHeight =  (window.innerHeight * 0.2) - 32;
        this.imgThumbnailWidth = this.imgThumbnailHeight;
        this.canvas = $('#canvas');
        this.canvas2 = $('#canvasImage');
        this.ctx = this.canvas[0].getContext('2d');
        this.ctxImg = this.canvas2[0].getContext('2d');
        this.canvasImage = new Image(this.canvasWidth, this.canvasHeight);
      }
    }


    changeFilterOptions (index) {
      if (this.filterList[index].isEnabled) {
        this.filtersApplied--;
      } else {
        this.filtersApplied++;
      }
      this.filterList[index].isEnabled = !this.filterList[index].isEnabled;
      this.createArray();
      this.noImagesLeft = false;
      this.currentImage = null;
      this.images = [];
      this.getImages();
    }

    // Whenever user scrolls down, this function will be executed to get more images
    getImages () {
      if (this.noImagesLeft) {
        this.notify.info(null, 'All Images have been fetched.');
        return;
      }
      this.fetchingInProcess = true;
      const currentImagesLength = this.images.length;

      if (this.searchFor == undefined) {
        this.searchFor = '';
      }
      const query = `projectId=${this.projectId}&skip=${currentImagesLength}&limit=${this.imagesLimit}&status=${this.filtersAppliedList}&sortingMethod=${this.sortingMethod}&searchTerm=${this.searchFor}&bucketName=${this.bucketName}`;

      this.http.get(environment.oclaviServer + 'viewImage/getImages?' + query, this.options)
          .subscribe( res => {
            const response = res.json();
            this.images = this.images.concat(response.images);
             // If the number of imgaes received less than the required no. of images per request, set NoImagesLeft to true
            if (response.images.length < this.imagesLimit || this.images.length === this.user.PROJECTS[this.projectId].TOTAL_IMAGES) {
              this.noImagesLeft = true;
            }
            this.fetchingInProcess = false; // Hiding the loading screen
          }, err => {
            this.fetchingInProcess = false;
            this.notify.error(null, 'Error occured while fetching images!');
          });
    }

    // Unlock image, if the image has ASSIGNED status
    unlockImage (id) {
      this.alertService.show('warn', 'Do you want to remove all classified data for this image and start over?');
      const data = {_id: id};

      this.alertService.positiveCallback = (() => {
        this.unlockingImage = true;
        this.alertService.hide();
        this.notify.info(null, 'Unlocking image, please wait..');
        this.http.post(environment.oclaviServer + 'viewImage/unlockImage', data, this.options)
          .subscribe( res => {
            // If 'NEW' filter is applied, then don't remove image from UI. Only set STATUS to NEW, Else remove from UI 
            for (let i = 0; i < this.images.length; i++) {
              if (this.images[i]._id === id) {
                if (this.filtersAppliedList.length === 0 || this.filtersAppliedList.indexOf('NEW') !== -1) {
                  this.images[i].STATUS = 'NEW';
                }
                else {
                  this.images.splice(i, 1);
                }
                break;
              }
            }
            this.unlockingImage = false;
            this.notify.success(null, 'Image Unlocked successfully.');
          }, err => {
            this.unlockingImage = false;
            this.notify.error(null, 'Error occured while unlocking image!');
          });
      });
    }

 unlockAllImages(){
 this.alertService.show('warn', 'Do you want to remove all classified data for this image and start over?');
 let k=0;
 let array_data=[];
 console.log("Im inside unlockallimages");
 for (let j=0; j< this.images.length; j++) {
    console.log("im inside the loop");
    if(this.images[j].STATUS == 'ASSIGNED'){
    let data = {_id : this.images[j]._id};
    array_data.push(data);
    }
    else{k++;}
  }
  console.log(array_data);

        this.alertService.positiveCallback = (() => {
        this.unlockingImage = true;
        this.alertService.hide();
        this.notify.info(null, 'Unlocking image, please wait..');
        this.http.post(environment.oclaviServer + 'viewImage/unlockAllImages', array_data, this.options)
          .subscribe( res => {
            // If 'NEW' filter is applied, then don't remove image from UI. Only set STATUS to NEW, Else remove from UI 
            for(let m = 0; m < array_data.length; m++){
            for (let i = 0; i < this.images.length; i++) {
              if (this.images[i]._id === array_data[m]._id) {
                if (this.filtersAppliedList.length === 0 || this.filtersAppliedList.indexOf('NEW') !== -1) {
                  this.images[i].STATUS = 'NEW';
                }
                else {
                  this.images.splice(i, 1);
                }
                break;
              }
            }
            }
            this.unlockingImage = false;
            this.notify.success(null, 'Images Unlocked successfully.');
          }, err => {
            this.unlockingImage = false;
            this.notify.error(null, 'Error occured while unlocking images!');
          });
      });
if(k==this.images.length){
  this.unlockingImage = false;
            this.notify.error(null, 'NO images present to unlock');
}
console.log(k);

 }
  


   

    // Modal will appear, when user clicks on INFO icon on image
    openModal (index, source?) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.currentImage = index;
      if (!source) {
        this.createArray(this.images);
      }

      $('#imageInfoModal').modal('show');
      this.canvasImage.src = this.images[index].data;
      this.ctxImg.drawImage(this.canvasImage, 0, 0, this.canvasWidth, this.canvasHeight);

      // Get ANNOTATED data for current image
      if (!this.images[index].details) {
        let id;
        if (this.images[index].STATUS === 'LOCKED') {
          id = this.images[index].OBJECT_OID;
        } else {
          id = this.images[index]._id;
        }
        this.getImageDetails(id, this.images[index].STATUS);
      } else {
        // If annotated data is already available on UI for current image, not making request for data
        this.drawAll(this.images[index].details);
      }
    }

    // Getting annotated data for current Selected image in modal
    getImageDetails (id, status) {
      const query = `viewImage/getImageDetails?id=${id}&status=${status}&projectId=${this.projectId}`;

      this.http.get(environment.oclaviServer + query, this.options)
        .subscribe( res => {
          const labelData = res.json().LABEL_DETAILS;

          if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
            const obj = {};
            labelData.forEach( label => {
              obj[label.LABEL_NAME] = {};
              for (let key in label) {
                if (key !== 'LABEL_NAME') {
                  obj[label.LABEL_NAME][environment.SHAPES[key]] = label[key];
                }
              }
            });
            this.images[this.currentImage].details = obj;
          } else {
            this.images[this.currentImage].details = labelData;
          }
        }, err => {
          $('#imageInfoModal').modal('hide');
          this.notify.error(null, 'An error occured while fetching image details!');
        });
    }

   // Draws the annotated data for classified image on modal
    drawAll(labelData) {
      // draws every shape in the queue. Not to be called directly from outside, internal function

      this.currentImageData = {};
      this.WIDTH = this.images[this.currentImage].IMAGE_WIDTH;
      this.HEIGHT = this.images[this.currentImage].IMAGE_HEIGHT;

      this.setRectDeatils(labelData);
      this.setPolyDetails(labelData);
      this.setCircleDteails(labelData);
      this.setPointDetails(labelData);
      this.setCuboidDetails(labelData);

      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.labels.forEach( label => {
        this.shapes.forEach(shape => {
          if (this.currentImageData[label][shape]) {
            this.currentImageData[label][shape].forEach((variable, index) => variable.draw(this.ctx, 1, index));
          }
        });
      });
    }


    setRectDeatils (labelData) {
      this.labels.forEach( label => {
        this.currentImageData[label] = {};

        if (labelData[label].rect && labelData[label].rect.length !== 0 ) {
          this.currentImageData[label].rect = new Array<Rectangle>();
          labelData[label].rect.forEach( (variable) => {
            let rectangle = new Rectangle();
            // If image is CLASSIFIED, change annotated data format like working image
            if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
              rectangle.setStartPoint((variable.START_X * 100) / this.WIDTH, (variable.START_Y * 100) / this.HEIGHT);
              rectangle.setWidthHeight((variable.WIDTH * 100) / this.WIDTH, (variable.HEIGHT * 100) / this.HEIGHT);
            } else {
              rectangle.setStartPoint(variable.startX, variable.startY);
              rectangle.setWidthHeight(variable.width, variable.height);
            }

            rectangle.fromPercentage(this.canvasWidth, this.canvasHeight);
            this.currentImageData[label].rect.push(rectangle);
          });
        }
      });
    }


    setPolyDetails (labelData) {
      this.labels.forEach( label => {
        
        if ( labelData[label].poly && labelData[label].poly.length !== 0) {
          this.currentImageData[label].poly = new Array<Polygon>();
          labelData[label].poly.forEach( (variable) => {
            let polygon = new Polygon();
            // If image is CLASSIFIED, change annotated data format like working image
            if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
              variable.COORDINATES.forEach((coordinate) => {
                polygon.addCoordinate((coordinate.X * 100) / this.WIDTH, (coordinate.Y * 100) / this.HEIGHT);
              });
            } else {
              variable.forEach((coordinate) => {
                polygon.addCoordinate(coordinate.x, coordinate.y);
              });
            }

            polygon.fromPercentage(this.canvasWidth, this.canvasHeight);
            this.currentImageData[label].poly.push(polygon);
          });
        }
      });
    }


    setCircleDteails(labelData) {
      this.labels.forEach( label => {
        
        if (labelData[label].circle && labelData[label].circle.length !== 0) {
          this.currentImageData[label].circle = new Array<Circle>();
          labelData[label].circle.forEach( (variable) => {
            let circle = new Circle();
            // If image is CLASSIFIED, change annotated data format like working image
            if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
              circle.setCentre((variable.CENTER_X * 100) / this.WIDTH, (variable.CENTRE_Y * 100) / this.HEIGHT);
              circle.setRadius((variable.RADIUS * 100) / this.WIDTH);
            } else {
              circle.setCentre(variable.centreX, variable.centreY);
              circle.setRadius(variable.radius);
            }

            circle.fromPercentage(this.canvasWidth, this.canvasHeight);
            this.currentImageData[label].circle.push(circle);
          });
        }
      });
    }


    setPointDetails (labelData) {
      this.labels.forEach( label => {
        
        if (labelData[label].point && labelData[label].point.length !== 0) {
          this.currentImageData[label].point = new Array<Point>();
          labelData[label].point.forEach( (variable) => {
            let point = new Point();
            // If image is CLASSIFIED, change annotated data format like working image
            if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
              point.setCentre((variable.CENTER_X * 100) / this.WIDTH, (variable.CENTRE_Y * 100) / this.HEIGHT);
            } else {
              point.setCentre(variable.centreX, variable.centreY);
            }

            point.fromPercentage(this.canvasWidth, this.canvasHeight);
            this.currentImageData[label].point.push(point);
          });
        }
      });
    }


    setCuboidDetails(labelData) {
      this.labels.forEach( label => {
        
        if (labelData[label].cuboid && labelData[label].cuboid.length !== 0) {
          this.currentImageData[label].cuboid = new Array<Cuboid>();
          labelData[label].cuboid.forEach( (variable) => {
            let cuboid = new Cuboid();
             // If image is CLASSIFIED, change annotated data format like working image
            if (this.images[this.currentImage].STATUS === 'CLASSIFIED') {
              cuboid.setStartPoint((variable.RECT1.START_X * 100) / this.WIDTH, (variable.RECT1.START_Y * 100) / this.HEIGHT);
              cuboid.setWidthHeight((variable.RECT1.WIDTH * 100) / this.WIDTH, (variable.RECT1.HEIGHT * 100) / this.HEIGHT);
              cuboid.setStartPoint((variable.RECT2.START_X * 100) / this.WIDTH, (variable.RECT2.START_Y * 100) / this.HEIGHT);
              cuboid.setWidthHeight((variable.RECT2.WIDTH * 100) / this.WIDTH, (variable.RECT2.HEIGHT * 100) / this.HEIGHT);
            } else {
              cuboid.setStartPoint(variable.rect1.x, variable.rect1.y);
              cuboid.setWidthHeight(variable.rect1.width, variable.rect1.height);
              cuboid.setStartPoint(variable.rect2.x, variable.rect2.y);
              cuboid.setWidthHeight(variable.rect2.width, variable.rect2.height);
            }

            cuboid.fromPercentage(this.canvasWidth, this.canvasHeight);
            this.currentImageData[label].cuboid.push(cuboid);
          });
        }
      });
    }

    // When user clicks on the eye icon next to label name on modal, this will shows drawn shapes for selected label
    annotateByLabel (label) {
      const index = this.labels.indexOf(label);

      if (index === -1) {
        this.labels.push(label);
        this.shapes = ['rect', 'poly', 'circle', 'point', 'cuboid'];
      } else {
        this.labels.splice(index, 1);
      }
      this.drawAll(this.images[this.currentImage].details);
    }

    // Shows Annotated data for current selected shape
    annotateByShape (shape, label) {
      const index = this.shapes.indexOf(shape);

      if (this.labels.indexOf(label) === -1) {
        this.labels.push(label);
        this.shapes = [];
      }

      if (index === -1) {
        this.shapes.push(shape);
      } else {
        this.shapes.splice(index, 1);
      }
      this.drawAll(this.images[this.currentImage].details);
    }

    // accordion on modal
    collapseLabel(labelName) {
      $('#' + labelName).collapse('toggle');
      $('#' + labelName).on({
        'show.bs.collapse': () => $('.' + labelName).attr('src', (i, link) => link = '../../assets/icons/open_folder.svg'),
        'hide.bs.collapse': () => $('.' + labelName).attr('src', (i, link) => link = '../../assets/icons/folder.svg')
      });
    }

    // changing to next image in modal
    openNextImage() {
      for (let i = this.currentImage + 1; i < this.images.length; i++) {
        if (this.images[i].STATUS === 'CLASSIFIED' || this.images[i].STATUS === 'ASSIGNED') {
          this.openModal(i, 'imageThumbnails');
          break;
        }
      }
    }

    // changing to previous image in modal
    openPrevImage() {
      for (let i = this.currentImage - 1; i >= 0; i--) {
        if (this.images[i].STATUS === 'CLASSIFIED' || this.images[i].STATUS === 'ASSIGNED') {
          this.openModal(i, 'imageThumbnails');
          break;
        }
      }
    }

    // Chnages sorting method for images
    changeSortingMethod (method) {
      this.sortingMethod = method;
      this.noImagesLeft = false;
      this.images = [];
      this.getImages();
    }


    createArray (images?) {
      if (!images) {
        // Updating filter list
        this.filtersAppliedList = [];
        for (let i = 0; i < this.filterList.length; i++) {
          if (this.filterList[i].isEnabled === true) {
            this.filtersAppliedList.push(this.filterList[i].status);
          }
        }
      } else {
        // This will be used to show image thumbnails at bottom in modal
        this.imageThumbnails = [];
        const limit = 10;
        for (let i = this.currentImage + 1; i < this.images.length; i++) {
          if (this.images[i].STATUS === 'CLASSIFIED' || this.images[i].STATUS === 'ASSIGNED') {
            this.images[i].index = i;
            this.imageThumbnails.push(this.images[i]);
            if (this.imageThumbnails.length === limit) {
              break;
            }
          }
        }
      }
    }

    // For editing an already classified image
    editImage (imageId) {
      const userType = this.user.USER_TYPE;

      if (userType == environment.USER_TYPE.TEAM.NAME || userType == environment.USER_TYPE.SELF.NAME || userType == environment.USER_TYPE.STUDENT_SELF.NAME) {
        this.router.navigate(['classify/' + imageId + '/edit']);
      }
    }

  }

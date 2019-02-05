import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit  } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';

declare var $: any;

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit, AfterViewInit {

  @Input() data;
  @Input() vm;
  @Input() billingAmount;
  @Input() payNow;
  @Output() stepId =  new EventEmitter<object>();
  title:string;
  session: any;
  selectedCurrency:string;

  constructor(private notify: NotificationsService) { }

  ngOnInit() {
    // Don't use any space in accordion title otherwise bootstrap accordion won't work, seperate words in title with '_'
    this.title = this.data ? this.data.title.replace(/_/g, ' ') : '';  // Removes any _ from title
    this.selectedCurrency = this.data.selectedMethod == 'razorpay' ? 'INR' : 'USD';
    this.session = JSON.parse(localStorage.getItem('user'));

    console.log();
    console.log(this.data);
  }

  collapseAccordion (id) {
    $('#' + id).collapse('toggle');
  }

  changeAccordion (step, direction) {
    if (step.step === 1 && step.title === 'shape_details') {
      const shapes = this.data.ownerEstimates.reduce((accumulator, currentValue) => accumulator += currentValue.num, 0);
      if (shapes < 1) {
        this.notify.error('Please enter number of shapes you need!');
        return;
      }
    }

    this.stepId.emit({currentStep: step, direction});
  }

  ngAfterViewInit () {
    if (this.data.status === 'active') {
      $('#parent-' + this.data.step + ' .dropdown-icon').addClass('rotate');
    }

    $('#parent-' + this.data.step + ' .card-header').on('click', () => {
      $('#parent-' + this.data.step + ' .dropdown-icon').toggleClass('rotate');
    });
  }

  changeMethod (method) { // Change payment method
    this.data.selectedMethod = method;

    switch(method) {
      case 'razorpay':
      this.selectedCurrency = 'INR';
      break;

      case 'paypal':
      this.selectedCurrency = 'USD';
      break;
    }
  }
}

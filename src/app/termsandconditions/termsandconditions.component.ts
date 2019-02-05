import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-termsandconditions',
  templateUrl: './termsandconditions.component.html',
  styleUrls: ['./termsandconditions.component.scss']
})
export class TermsandconditionsComponent implements OnInit {
  
  constructor(private titleService: Title ){ }


  ngOnInit() {
    this.titleService.setTitle( 'Terms and Conditions - OCLAVI' );
  }

}

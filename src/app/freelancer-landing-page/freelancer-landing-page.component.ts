import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-freelancer-landing-page',
  templateUrl: './freelancer-landing-page.component.html',
  styleUrls: ['./freelancer-landing-page.component.scss']
})
export class FreelancerLandingPageComponent implements OnInit {

  constructor(private titleService: Title, public meta: Meta) { }

  ngOnInit() {
    this.titleService.setTitle( 'Freelancer | Object Classification and Annotation for Computer Vision Models' );
    this.meta.updateTag({ name: 'description', content: 'A freelancer platform to provide a Human-In-Loop for machine learning, aritifical intelligence and nlp models annotation with auto prediction.' }); 
    this.meta.addTag({ name: 'keywords', content: 'freelancer, human in loop, earn money, image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification' }); 
  }

}

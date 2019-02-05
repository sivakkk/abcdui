import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) { 
    titleService.setTitle('Frequently Asked Questions - OCLAVI');
      meta.addTags([
        { name: 'author', content: 'Carabiner Technologies Private Limited'},
        { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification, cuboidal annotation, cuboidal annotation tool, 3D cuboid annotations, 3d cuboid annotation tool, 3D cuboid for perception, 3D cuboid computer vision, 3D cuboid labeling, image annotation, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' },
        { name: 'description', content: 'Frequently asked questions on our image annotation platform which allows to classify images for machine learning, aritifical intelligence and nlp models in a collaborative way which solve the real world problems.' }
    ]);
  }

  ngOnInit() {
  }

}

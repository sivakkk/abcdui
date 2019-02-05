import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-bounding-box-annotation',
  templateUrl: './bounding-box-annotation.component.html',
  styleUrls: ['./bounding-box-annotation.component.scss']
})
export class BoundingBoxAnnotationComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) { 
    titleService.setTitle('Bounding Box Annotation - OCLAVI');
      meta.addTags([
          { name: 'author', content: 'Carabiner Technologies Private Limited'},
          { name: 'keywords', content: 'image annotation, bounding box annotation, bounding box annotation tool, bounding box for object detection, bounding box computer vision, bounding box labeling, image annotation, rectangular annotation, boundbox annotation, image classification, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' },
          { name: 'description', content: 'Bounding box annotations for images to build self-driving, robot, drone and augmented reality models in a collaborative way.' }
      ]);
  }

  ngOnInit() {
  }

}

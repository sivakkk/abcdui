import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-polygonal-annotation',
  templateUrl: './polygonal-annotation.component.html',
  styleUrls: ['./polygonal-annotation.component.scss']
})
export class PolygonalAnnotationComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) { 
    titleService.setTitle('Polygonal Annotation - OCLAVI');
      meta.addTags([
        { name: 'author', content: 'Carabiner Technologies Private Limited'},
        { name: 'keywords', content: 'polygonal annotation, polygon annotation tool, polygonal segmentation annotation, polygonal segmentation annotation tool, polygonal segmentation computer vision, polygonal segmentation labeling, image annotation, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' },
        { name: 'description', content: 'Polygonal annotation helps to annotate precisely to detect objest and Localization in images and videos in a collaborative way.' }
    ]);
  }

  ngOnInit() {
  }

}

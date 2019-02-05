import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-cuboidal-annotation',
  templateUrl: './cuboidal-annotation.component.html',
  styleUrls: ['./cuboidal-annotation.component.scss']
})
export class CuboidalAnnotationComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) { 
    titleService.setTitle('Cuboidal Annotation - OCLAVI');
      meta.addTags([
        { name: 'author', content: 'Carabiner Technologies Private Limited'},
        { name: 'keywords', content: 'cuboidal annotation, cuboidal annotation tool, 3D cuboid annotations, 3d cuboid annotation tool, 3D cuboid for perception, 3D cuboid computer vision, 3D cuboid labeling, image annotation, machine learning annotations, computer vision models annotation, artificial intelligence, deep learning classification' },
        { name: 'description', content: 'Cuboidal annotations helps to annotate 3D objects from 2-Dimentional images and videos in a collaborative way.' }
    ]);
  }

  ngOnInit() {
  }

}

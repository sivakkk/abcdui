import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-uc-agriculture-tech-computer-vision-model',
  templateUrl: './uc-agriculture-tech-computer-vision-model.component.html',
  styleUrls: ['./uc-agriculture-tech-computer-vision-model.component.scss']
})
export class UcAgricultureTechComputerVisionModelComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) {
    titleService.setTitle('Detecting Plant disease with Computer vision models | Use Case | OCLAVI');
      meta.addTags([
          { name: 'author', content: 'Carabiner Technologies Private Limited'},
          { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification' },
          { name: 'description', content: 'Artificial Intelligence (AI) helps farmers reinvent the way they did farming for decades. Computer vision models built on the basis of Artificial Intelligence & machine learning inspired modernization in agriculture sector.' }
      ]);
   }

  ngOnInit() {
  }

}

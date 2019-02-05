import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-uc-hydrocarbon-exploration',
  templateUrl: './uc-hydrocarbon-exploration.component.html',
  styleUrls: ['./uc-hydrocarbon-exploration.component.scss']
})
export class UcHydrocarbonExplorationComponent implements OnInit {

  constructor(meta: Meta, titleService: Title) {
    titleService.setTitle('Hydrocarbon exploration made easy with Artificial Intelligence | Use Case | OCLAVI');
      meta.addTags([
          { name: 'author', content: 'Carabiner Technologies Private Limited'},
          { name: 'keywords', content: 'image annotation, polygon annotation, machine learning, labelling, classification, bound box annotation, image classification, artificial intelligence, deep learning classification' },
          { name: 'description', content: 'Hydrocarbon exploration is an expensive affair; hence it has to be initiated only after costs and benefits are assessed. There are various methods to identify the sources of oil and gas like Well logging, remote sensing, Gravity survey, magnetic survey, seismic survey etc. which involves high costs and efforts.' }
      ]);
   }

  ngOnInit() {
  }

}

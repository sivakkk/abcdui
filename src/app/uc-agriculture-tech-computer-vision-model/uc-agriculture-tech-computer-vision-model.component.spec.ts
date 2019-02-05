import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UcAgricultureTechComputerVisionModelComponent } from './uc-agriculture-tech-computer-vision-model.component';

describe('UcAgricultureTechComputerVisionModelComponent', () => {
  let component: UcAgricultureTechComputerVisionModelComponent;
  let fixture: ComponentFixture<UcAgricultureTechComputerVisionModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UcAgricultureTechComputerVisionModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UcAgricultureTechComputerVisionModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

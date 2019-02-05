import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundingBoxAnnotationComponent } from './bounding-box-annotation.component';

describe('BoundingBoxAnnotationComponent', () => {
  let component: BoundingBoxAnnotationComponent;
  let fixture: ComponentFixture<BoundingBoxAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundingBoxAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundingBoxAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

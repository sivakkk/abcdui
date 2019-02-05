import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygonalAnnotationComponent } from './polygonal-annotation.component';

describe('PolygonalAnnotationComponent', () => {
  let component: PolygonalAnnotationComponent;
  let fixture: ComponentFixture<PolygonalAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolygonalAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygonalAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuboidalAnnotationComponent } from './cuboidal-annotation.component';

describe('CuboidalAnnotationComponent', () => {
  let component: CuboidalAnnotationComponent;
  let fixture: ComponentFixture<CuboidalAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuboidalAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuboidalAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

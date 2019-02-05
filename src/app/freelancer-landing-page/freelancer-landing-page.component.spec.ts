import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerLandingPageComponent } from './freelancer-landing-page.component';

describe('FreelancerLandingPageComponent', () => {
  let component: FreelancerLandingPageComponent;
  let fixture: ComponentFixture<FreelancerLandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreelancerLandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreelancerLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreelancerVerifyPermalinkComponent } from './freelancer-verify-permalink.component';

describe('FreelancerVerifyPermalinkComponent', () => {
  let component: FreelancerVerifyPermalinkComponent;
  let fixture: ComponentFixture<FreelancerVerifyPermalinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreelancerVerifyPermalinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreelancerVerifyPermalinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

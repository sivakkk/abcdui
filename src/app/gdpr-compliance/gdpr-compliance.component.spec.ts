import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GdprComplianceComponent } from './gdpr-compliance.component';

describe('GdprComplianceComponent', () => {
  let component: GdprComplianceComponent;
  let fixture: ComponentFixture<GdprComplianceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GdprComplianceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GdprComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

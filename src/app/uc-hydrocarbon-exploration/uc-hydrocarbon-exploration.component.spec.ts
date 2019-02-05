import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UcHydrocarbonExplorationComponent } from './uc-hydrocarbon-exploration.component';

describe('UcHydrocarbonExplorationComponent', () => {
  let component: UcHydrocarbonExplorationComponent;
  let fixture: ComponentFixture<UcHydrocarbonExplorationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UcHydrocarbonExplorationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UcHydrocarbonExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

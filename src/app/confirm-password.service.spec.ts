import { TestBed, inject } from '@angular/core/testing';

import { ConfirmPasswordService } from './confirm-password.service';

describe('ConfirmPasswordService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmPasswordService]
    });
  });

  it('should be created', inject([ConfirmPasswordService], (service: ConfirmPasswordService) => {
    expect(service).toBeTruthy();
  }));
});

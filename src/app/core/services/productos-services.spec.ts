import { TestBed } from '@angular/core/testing';

import { ProductosServices } from './productos-services';

describe('ProductosServices', () => {
  let service: ProductosServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

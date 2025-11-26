import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HospitalizacionCardComponent } from './hospitalizacion-card.component';

describe('HospitalizacionCardComponent', () => {
  let component: HospitalizacionCardComponent;
  let fixture: ComponentFixture<HospitalizacionCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HospitalizacionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HospitalizacionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

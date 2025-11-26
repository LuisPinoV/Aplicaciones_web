import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcedimientosCardComponent } from './procedimientos-card.component';

describe('ProcedimientosCardComponent', () => {
  let component: ProcedimientosCardComponent;
  let fixture: ComponentFixture<ProcedimientosCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProcedimientosCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcedimientosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
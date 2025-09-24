import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicamentosCardComponent } from './medicamentos-card.component';

describe('MedicamentosCardComponent', () => {
  let component: MedicamentosCardComponent;
  let fixture: ComponentFixture<MedicamentosCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MedicamentosCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicamentosCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
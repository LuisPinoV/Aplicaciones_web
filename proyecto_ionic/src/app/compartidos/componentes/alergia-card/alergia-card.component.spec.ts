import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlergiaCardComponent } from './alergia-card.component';

describe('AlergiaCardComponent', () => {
  let component: AlergiaCardComponent;
  let fixture: ComponentFixture<AlergiaCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlergiaCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlergiaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
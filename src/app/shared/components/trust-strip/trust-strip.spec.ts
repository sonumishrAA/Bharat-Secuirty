import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrustStripComponent } from './trust-strip';

describe('TrustStripComponent', () => {
  let component: TrustStripComponent;
  let fixture: ComponentFixture<TrustStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustStripComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrustStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create trust strip', () => {
    expect(component).toBeTruthy();
  });
});

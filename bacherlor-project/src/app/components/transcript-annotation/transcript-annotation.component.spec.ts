import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptAnnotationComponent } from './transcript-annotation.component';

describe('WebSpeechComponent', () => {
  let component: TranscriptAnnotationComponent;
  let fixture: ComponentFixture<TranscriptAnnotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscriptAnnotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscriptAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

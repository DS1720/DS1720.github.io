import {Component, Input, OnInit} from '@angular/core';
import {Annotation} from '../../shared/Entities/annotation';

@Component({
  selector: 'wsa-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.css']
})
export class AnnotationItemComponent implements OnInit {

  @Input() annotationItem: {annotation: Annotation, annotationText: string, comment: string, links: string[]} = {
    annotation: new Annotation(-1, '', -1, -1, '', -1, -1, false),
    annotationText: '',
    comment: '',
    links: []
  };

  constructor() { }

  ngOnInit(): void {
  }

}

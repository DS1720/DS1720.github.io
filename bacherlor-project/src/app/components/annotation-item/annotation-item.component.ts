import {Component, Input, OnInit} from '@angular/core';
import {Annotation} from '../../shared/Entities/annotation';
import {faArrowCircleRight, faPlus, faMinus, faTrash} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'wsa-annotation-item',
  templateUrl: './annotation-item.component.html',
  styleUrls: ['./annotation-item.component.css']
})
export class AnnotationItemComponent implements OnInit {

  faArrowCircleRight = faArrowCircleRight;
  faPlus = faPlus;
  faMinus = faMinus;
  faTrash = faTrash;

  @Input() annotationItem: {annotation: Annotation, annotationText: string, comment: string, links: string[]} = {
    annotation: new Annotation(-1, '', -1, -1, '', -1, -1, false),
    annotationText: '',
    comment: '',
    links: []
  };
  @Input() edit = false;
  selectedLink = '';

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * adds Link to annotationItem
   */
  addLink(): void {
    this.annotationItem.links.push(this.selectedLink);
    this.selectedLink = '';
  }

  /**
   * deletes link from annotationItem
   * @param link in annotationItem
   */
  deleteLink(link: string): void {
    const index = this.annotationItem.links.indexOf(link);
    if (index > -1) {
      this.annotationItem.links.splice(index, 1);
    }
  }

}

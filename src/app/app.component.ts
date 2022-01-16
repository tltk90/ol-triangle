import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ol-triangle';

  goToRepo(): void {
    window.open('https://github.com/tltk90/ol-triangle');
  }
}

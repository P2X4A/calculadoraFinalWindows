import { Component, signal } from '@angular/core';
import {Navbarcomponent} from './navbarcomponent/navbarcomponent';
import {Contenidocomponent} from './contenidocomponent/contenidocomponent';
import {Footercomponent} from './footercomponent/footercomponent';

@Component({
  selector: 'app-root',
  imports: [Navbarcomponent, Contenidocomponent, Footercomponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('calculadora');
}

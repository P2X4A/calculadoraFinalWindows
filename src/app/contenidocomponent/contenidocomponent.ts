import { Component } from '@angular/core';

@Component({
  selector: 'app-contenidocomponent',
  imports: [],
  templateUrl: './contenidocomponent.html',
  styleUrl: './contenidocomponent.css',
})
export class Contenidocomponent {
  // Operaciones básicas de la calculadora como en la Calculadora de Windows (modo estándar)
  /** Devuelve la suma de dos números */
  sumar(a: number, b: number): number {
    return a + b;
  }

  /** Devuelve la resta a - b */
  restar(a: number, b: number): number {
    return a - b;
  }

  /** Devuelve el producto de dos números */
  multiplicar(a: number, b: number): number {
    return a * b;
  }

  /** Devuelve el cociente a / b; devuelve NaN si la división es por cero */
  dividir(a: number, b: number): number {
    if(b == 0){
      return 0;
    }
    return a / b;
  }

  /** Devuelve el porcentaje (a % de b) */
  porcentaje(a: number, b: number): number {
    return (a * b) / 100;
  }

  /** Devuelve la raíz cuadrada de un número */
  raizCuadrada(a: number): number {
    return Math.sqrt(a);
  }
}

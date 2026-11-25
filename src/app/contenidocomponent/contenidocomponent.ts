import { Component, HostListener } from '@angular/core';

/**
 * Componente principal de la calculadora.
 *
 * Contiene el estado de la operación actual, la lógica de los botones
 * y los valores que se muestran en la interfaz HTML.
 */
@Component({
  selector: 'app-contenidocomponent',
  standalone: true,
  imports: [],
  templateUrl: './contenidocomponent.html',
  styleUrl: './contenidocomponent.css',
})
export class Contenidocomponent {
  /**
   * Valor visible en la pantalla de la calculadora.
   *
   * Se maneja como texto para permitir:
   * - Escribir números de varios dígitos.
   * - Usar punto decimal.
   * - Mostrar "Error" si la operación es inválida.
   */
  pantalla: string = '0';

  /**
   * Primer número de la operación.
   *
   * Ejemplo:
   * Si el usuario escribe "34" y pulsa "+",
   * numero1 queda guardado como 34.
   */
  numero1: number | null = null;

  /**
   * Segundo número de la operación.
   *
   * Se almacena cuando el usuario pulsa "=".
   */
  numero2: number | null = null;

  /**
   * Símbolo del operador elegido por el usuario.
   *
   * Valores posibles:
   * '+', '-', '*', '/'
   */
  operador: string = '';

  /**
   * Resultado de la última operación calculada.
   *
   * Puede ser null antes de hacer una operación.
   */
  resultado: number | null = null;

  /**
   * Indica que se acaba de seleccionar un operador.
   *
   * Ejemplo:
   * 34 + [esperando segundo número]
   *
   * Cuando sea true y el usuario pulse un número, la pantalla
   * se reemplaza por el nuevo número en lugar de concatenarlo.
   */
  esperandoNumero2: boolean = false;

  /**
   * Indica que la pantalla actualmente muestra un resultado.
   *
   * Ejemplo:
   * 34 + 2 = 36
   *
   * Si luego pulsa 7, comenzará un nuevo número "7",
   * no se convertirá en "367".
   */
  mostrandoResultado: boolean = false;

  /**
   * Valor guardado con MS, M+ o M−.
   *
   * Es null mientras la memoria está vacía; así la vista puede
   * deshabilitar MC y MR.
   */
  memoria: number | null = null;

  /**
   * Agrega un dígito o un punto decimal a la pantalla.
   *
   * @param valor Número como texto, por ejemplo '7', '0' o '.'
   */
  agregarNumero(valor: string): void {
    // Si antes ocurrió un error, empezar una nueva operación.
    if (this.pantalla === 'Error') {
      this.limpiarTodo();
    }

    // Después de un operador o un resultado, iniciar un número nuevo.
    if (this.esperandoNumero2 || this.mostrandoResultado) {
      this.pantalla = valor === '.' ? '0.' : valor;
      this.esperandoNumero2 = false;
      this.mostrandoResultado = false;
      return;
    }

    // No permitir más de un punto decimal en el mismo número.
    if (valor === '.' && this.pantalla.includes('.')) {
      return;
    }

    // Si la pantalla contiene 0, reemplazarlo por el nuevo dígito.
    // Se conserva el 0 al empezar un decimal: 0.5.
    if (this.pantalla === '0') {
      this.pantalla = valor === '.' ? '0.' : valor;
      return;
    }

    // Agregar el dígito al final del texto actual.
    this.pantalla += valor;
  }

  /**
   * Guarda el primer número y el operador pulsado.
   *
   * También permite operaciones encadenadas:
   * 5 + 3 + 2 = 10
   *
   * @param operadorSeleccionado Operador: '+', '-', '*', '/'
   */
  seleccionarOperador(operadorSeleccionado: string): void {
    // No permite operar mientras se muestra un error.
    if (this.pantalla === 'Error') {
      return;
    }

    const valorActual = Number(this.pantalla);

    // Si es la primera operación, guardar el valor actual como numero1.
    if (this.numero1 === null) {
      this.numero1 = valorActual;
    }

      // Si ya había una operación pendiente y se escribió numero2,
    // calcular antes de guardar el nuevo operador.
    else if (!this.esperandoNumero2 && this.operador !== '') {
      const resultadoTemporal = this.realizarOperacion(
        this.numero1,
        valorActual,
        this.operador
      );

      // Si la operación fue inválida, mostrar Error.
      if (resultadoTemporal === null) {
        this.mostrarError();
        return;
      }

      // Mostrar el resultado temporal y usarlo como nuevo numero1.
      this.pantalla = this.formatearNumero(resultadoTemporal);
      this.numero1 = resultadoTemporal;
    }

    // Guardar el nuevo operador seleccionado.
    this.operador = operadorSeleccionado;

    // Preparar la pantalla para que el usuario escriba numero2.
    this.esperandoNumero2 = true;
    this.mostrandoResultado = false;
  }

  /**
   * Ejecuta la operación pendiente cuando se pulsa "=".
   *
   * Ejemplo:
   * 34 + 2 =
   * numero1 = 34
   * numero2 = 2
   * pantalla = 36
   */
  calcularResultado(): void {
    // No hay nada que calcular sin primer número u operador.
    if (
      this.numero1 === null ||
      this.operador === '' ||
      this.pantalla === 'Error'
    ) {
      return;
    }

    // Convertir lo escrito en pantalla al segundo número.
    this.numero2 = Number(this.pantalla);

    // Ejecutar la operación según el operador guardado.
    const resultadoCalculado = this.realizarOperacion(
      this.numero1,
      this.numero2,
      this.operador
    );

    // Mostrar Error para una operación inválida, como dividir entre 0.
    if (resultadoCalculado === null) {
      this.mostrarError();
      return;
    }

    // Guardar y mostrar el resultado final.
    this.resultado = resultadoCalculado;
    this.pantalla = this.formatearNumero(resultadoCalculado);

    // Limpiar los valores de operación para empezar una nueva.
    this.numero1 = null;
    this.numero2 = null;
    this.operador = '';
    this.esperandoNumero2 = false;

    // Indicar que la pantalla contiene un resultado.
    this.mostrandoResultado = true;
  }

  /**
   * Restablece por completo el estado de la calculadora.
   *
   * Corresponde al botón C.
   */
  limpiarTodo(): void {
    this.pantalla = '0';
    this.numero1 = null;
    this.numero2 = null;
    this.operador = '';
    this.resultado = null;
    this.esperandoNumero2 = false;
    this.mostrandoResultado = false;
  }

  /**
   * Limpia solo el número que aparece en pantalla.
   *
   * Corresponde al botón CE.
   * Conserva numero1 y el operador si hay una operación pendiente.
   */
  limpiarEntrada(): void {
    this.pantalla = '0';
    this.mostrandoResultado = false;
  }

  /**
   * Elimina el último carácter de la pantalla.
   *
   * Corresponde al botón ⌫.
   */
  borrarUltimo(): void {
    // No borrar si todavía no se ha escrito el segundo número
    // o si se muestra un resultado final.
    if (
      this.pantalla === 'Error' ||
      this.esperandoNumero2 ||
      this.mostrandoResultado
    ) {
      return;
    }

    // Si hay un solo carácter, volver a cero.
    if (this.pantalla.length <= 1) {
      this.pantalla = '0';
      return;
    }

    // Eliminar el último carácter.
    this.pantalla = this.pantalla.slice(0, -1);

    // Evitar estados inválidos como "-" o una cadena vacía.
    if (this.pantalla === '-' || this.pantalla === '') {
      this.pantalla = '0';
    }
  }

  /**
   * Cambia el signo del número visible.
   *
   * Corresponde al botón ±.
   *
   * Ejemplos:
   * 25 se convierte en -25.
   * -25 se convierte en 25.
   */
  cambiarSigno(): void {
    if (this.pantalla === '0' || this.pantalla === 'Error') {
      return;
    }

    const valor = Number(this.pantalla) * -1;
    this.pantalla = this.formatearNumero(valor);
  }

  /**
   * Convierte el valor mostrado a porcentaje.
   *
   * Ejemplo:
   * 25 se convierte en 0.25.
   */
  calcularPorcentaje(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    const valor = Number(this.pantalla) / 100;
    this.pantalla = this.formatearNumero(valor);
    this.mostrandoResultado = true;
  }

  /**
   * Calcula el inverso de un número: 1 / x.
   *
   * Ejemplo:
   * 4 se convierte en 0.25.
   */
  calcularInverso(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    const valor = Number(this.pantalla);

    // No existe el inverso de cero.
    if (valor === 0) {
      this.mostrarError();
      return;
    }

    this.pantalla = this.formatearNumero(1 / valor);
    this.mostrandoResultado = true;
  }

  /**
   * Eleva al cuadrado el número mostrado: x².
   *
   * Ejemplo:
   * 5 se convierte en 25.
   */
  elevarAlCuadrado(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    const valor = Number(this.pantalla);
    this.pantalla = this.formatearNumero(valor * valor);
    this.mostrandoResultado = true;
  }

  /**
   * Calcula la raíz cuadrada del número mostrado: √x.
   *
   * Ejemplo:
   * 81 se convierte en 9.
   */
  calcularRaizCuadrada(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    const valor = Number(this.pantalla);

    // En números reales no existe raíz cuadrada de negativos.
    if (valor < 0) {
      this.mostrarError();
      return;
    }

    this.pantalla = this.formatearNumero(Math.sqrt(valor));
    this.mostrandoResultado = true;
  }

  /**
   * Devuelve texto con la operación que se está preparando.
   *
   * Se usa opcionalmente en el HTML para mostrar:
   * "34 +" en una línea pequeña sobre la pantalla.
   */
  get operacionActual(): string {
    if (this.numero1 === null || this.operador === '') {
      return '';
    }

    const simbolos: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    const simbolo = simbolos[this.operador] ?? this.operador;

    return `${this.formatearNumero(this.numero1)} ${simbolo}`;
  }

  /** Borra el valor guardado en memoria (MC). */
  limpiarMemoria(): void {
    this.memoria = null;
  }

  /** Muestra en pantalla el valor guardado en memoria (MR). */
  recuperarMemoria(): void {
    if (this.memoria === null) {
      return;
    }

    this.pantalla = this.formatearNumero(this.memoria);
    this.esperandoNumero2 = false;
    this.mostrandoResultado = true;
  }

  /** Guarda en memoria el número de la pantalla (MS). */
  guardarEnMemoria(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    this.memoria = Number(this.pantalla);
    this.mostrandoResultado = true;
  }

  /** Suma el número de la pantalla a la memoria (M+). */
  sumarAMemoria(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    this.memoria = (this.memoria ?? 0) + Number(this.pantalla);
    this.mostrandoResultado = true;
  }

  /** Resta el número de la pantalla de la memoria (M−). */
  restarDeMemoria(): void {
    if (this.pantalla === 'Error') {
      return;
    }

    this.memoria = (this.memoria ?? 0) - Number(this.pantalla);
    this.mostrandoResultado = true;
  }

  /**
   * Permite usar la calculadora con el teclado, como en Windows:
   * números, punto o coma, + - * /, Enter o = para el resultado,
   * Backspace para borrar, Escape para C y Supr para CE.
   */
  @HostListener('window:keydown', ['$event'])
  manejarTeclado(evento: KeyboardEvent): void {
    const tecla = evento.key;

    if (/^[0-9]$/.test(tecla)) {
      this.agregarNumero(tecla);
    } else {
      switch (tecla) {
        case '.':
        case ',':
          this.agregarNumero('.');
          break;
        case '+':
        case '-':
        case '*':
        case '/':
          this.seleccionarOperador(tecla);
          break;
        case 'Enter':
        case '=':
          this.calcularResultado();
          break;
        case 'Backspace':
          this.borrarUltimo();
          break;
        case 'Escape':
          this.limpiarTodo();
          break;
        case 'Delete':
          this.limpiarEntrada();
          break;
        case '%':
          this.calcularPorcentaje();
          break;
        default:
          return;
      }
    }

    // Evita que Enter vuelva a pulsar el botón con foco o que "/" abra la búsqueda del navegador.
    evento.preventDefault();
  }

  /**
   * Ejecuta una operación matemática entre dos números.
   *
   * @param primerNumero Número ubicado a la izquierda del operador.
   * @param segundoNumero Número ubicado a la derecha del operador.
   * @param operador Operador que determina la operación.
   * @returns Resultado numérico o null si la operación no es válida.
   */
  private realizarOperacion(
    primerNumero: number,
    segundoNumero: number,
    operador: string
  ): number | null {
    switch (operador) {
      case '+':
        return primerNumero + segundoNumero;

      case '-':
        return primerNumero - segundoNumero;

      case '*':
        return primerNumero * segundoNumero;

      case '/':
        // Se evita una división entre cero.
        return segundoNumero === 0 ? null : primerNumero / segundoNumero;

      default:
        return null;
    }
  }

  /**
   * Formatea resultados decimales para evitar valores de JavaScript
   * como 0.30000000000000004.
   *
   * @param numero Número que se mostrará en pantalla.
   * @returns Número convertido a texto, con máximo 10 decimales.
   */
  private formatearNumero(numero: number): string {
    // Evitar que Infinity o NaN aparezcan en pantalla.
    if (!Number.isFinite(numero)) {
      return 'Error';
    }

    return Number(numero.toFixed(10)).toString();
  }

  /**
   * Establece el estado de error y elimina los datos pendientes.
   */
  private mostrarError(): void {
    this.pantalla = 'Error';
    this.numero1 = null;
    this.numero2 = null;
    this.operador = '';
    this.resultado = null;
    this.esperandoNumero2 = false;
    this.mostrandoResultado = false;
  }
}

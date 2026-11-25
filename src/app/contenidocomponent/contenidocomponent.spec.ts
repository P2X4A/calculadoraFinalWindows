import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contenidocomponent } from './contenidocomponent';

describe('Contenidocomponent', () => {
  let calc: Contenidocomponent;
  let fixture: ComponentFixture<Contenidocomponent>;

  /** Pulsa varias teclas de la calculadora, por ejemplo escribir('12+3='). */
  function escribir(teclas: string): void {
    for (const tecla of teclas) {
      if ('+-*/'.includes(tecla)) {
        calc.seleccionarOperador(tecla);
      } else if (tecla === '=') {
        calc.calcularResultado();
      } else {
        calc.agregarNumero(tecla);
      }
    }
  }

  function pulsarTecla(key: string): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contenidocomponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Contenidocomponent);
    calc = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('empieza en 0', () => {
    expect(calc.pantalla).toBe('0');
  });

  it('suma, resta, multiplica y divide', () => {
    escribir('12+3=');
    expect(calc.pantalla).toBe('15');

    escribir('20-25=');
    expect(calc.pantalla).toBe('-5');

    escribir('6*7=');
    expect(calc.pantalla).toBe('42');

    escribir('9/4=');
    expect(calc.pantalla).toBe('2.25');
  });

  it('encadena operaciones como la calculadora de Windows', () => {
    escribir('2+3*');
    expect(calc.pantalla).toBe('5');
    expect(calc.operacionActual).toBe('5 ×');

    escribir('4=');
    expect(calc.pantalla).toBe('20');
  });

  it('evita errores de coma flotante al mostrar el resultado', () => {
    escribir('0.1+0.2=');
    expect(calc.pantalla).toBe('0.3');
  });

  it('no deja escribir dos puntos decimales', () => {
    escribir('1..5');
    expect(calc.pantalla).toBe('1.5');
  });

  it('muestra Error al dividir entre cero y se recupera con un número nuevo', () => {
    escribir('8/0=');
    expect(calc.pantalla).toBe('Error');

    escribir('7');
    expect(calc.pantalla).toBe('7');
  });

  it('calcula inverso, cuadrado, raíz y porcentaje', () => {
    escribir('4');
    calc.calcularInverso();
    expect(calc.pantalla).toBe('0.25');

    calc.limpiarTodo();
    escribir('9');
    calc.elevarAlCuadrado();
    expect(calc.pantalla).toBe('81');

    calc.calcularRaizCuadrada();
    expect(calc.pantalla).toBe('9');

    calc.limpiarTodo();
    escribir('50');
    calc.calcularPorcentaje();
    expect(calc.pantalla).toBe('0.5');
  });

  it('muestra Error con la raíz de un negativo y con el inverso de 0', () => {
    escribir('9');
    calc.cambiarSigno();
    calc.calcularRaizCuadrada();
    expect(calc.pantalla).toBe('Error');

    calc.limpiarTodo();
    calc.calcularInverso();
    expect(calc.pantalla).toBe('Error');
  });

  it('borra el último dígito, la entrada (CE) y todo (C)', () => {
    escribir('123');
    calc.borrarUltimo();
    expect(calc.pantalla).toBe('12');

    escribir('+5');
    calc.limpiarEntrada();
    expect(calc.pantalla).toBe('0');
    expect(calc.operacionActual).toBe('12 +');

    calc.limpiarTodo();
    expect(calc.pantalla).toBe('0');
    expect(calc.operacionActual).toBe('');
  });

  it('guarda, suma, resta, recupera y borra la memoria', () => {
    expect(calc.memoria).toBeNull();

    escribir('10');
    calc.guardarEnMemoria();
    escribir('5');
    calc.sumarAMemoria();
    escribir('3');
    calc.restarDeMemoria();
    expect(calc.memoria).toBe(12);

    calc.limpiarTodo();
    calc.recuperarMemoria();
    expect(calc.pantalla).toBe('12');

    calc.limpiarMemoria();
    expect(calc.memoria).toBeNull();
  });

  it('se puede usar con el teclado', () => {
    for (const tecla of ['7', ',', '5', '*', '2', 'Enter']) {
      pulsarTecla(tecla);
    }
    expect(calc.pantalla).toBe('15');

    pulsarTecla('Escape');
    expect(calc.pantalla).toBe('0');
  });

  it('deshabilita MC y MR mientras la memoria está vacía', async () => {
    const botones = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('.memoria button'));

    await fixture.whenStable();
    expect(botones()[0].disabled).toBe(true);
    expect(botones()[1].disabled).toBe(true);

    // Pulsar MS desde la interfaz, como lo haría el usuario.
    botones()[4].click();
    await fixture.whenStable();
    expect(botones()[0].disabled).toBe(false);
    expect(botones()[1].disabled).toBe(false);
  });
});

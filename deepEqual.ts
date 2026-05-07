// Тип для сравниваемых значений
type DeepComparable = unknown;

// Интерфейс для описания объекта
interface ObjectLike {
  [key: string]: unknown;
}

// Интерфейс для результата теста
interface TestResult {
  name: string;
  passed: boolean;
  expected: boolean;
  actual: boolean;
}

/**
 * Глубокое сравнение двух значений
 * @param a - первое значение
 * @param b - второе значение
 * @param visited - WeakSet для отслеживания циклических ссылок
 * @returns boolean - равны ли значения
 */
function deepEqual(a: DeepComparable, b: DeepComparable, visited: WeakSet<object> = new WeakSet()): boolean {
  // 1. Строгое равенство
  if (a === b) return true;

  // 2. Если один null или не объект, а другой нет — false
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // 3. Проверка на циклические ссылки
  if (typeof a === 'object' && a !== null) {
    if (visited.has(a as object)) {
      return a === b;
    }
    visited.add(a as object);
  }

  // 4. Массивы
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], visited)) return false;
    }
    return true;
  }

  // 5. Один массив, другой нет
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // 6. Обычные объекты
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    // Проверяем наличие ключа в b
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    // Рекурсивное сравнение значений
    if (!deepEqual((a as ObjectLike)[key], (b as ObjectLike)[key], visited)) return false;
  }

  return true;
}

{// Функция для запуска тестов
function runTest(name: string, actual: boolean, expected: boolean): void {
  const passed = actual === expected;
  console.log(`${passed ? '✓' : '✗'} ${name}: ожидалось ${expected}, получено ${actual}`);
}

// Тест 1: Примитивы
runTest('Примитивы (числа)', deepEqual(42, 42), true);
runTest('Примитивы (числа разные)', deepEqual(42, 43), false);
runTest('Примитивы (строка и число)', deepEqual(42, '42'), false);
runTest('Примитивы (null и undefined)', deepEqual(null, undefined), false);
runTest('Примитивы (null и null)', deepEqual(null, null), true);

// Тест 2: Массивы
runTest('Массивы (одинаковые)', deepEqual([1, 2, 3], [1, 2, 3]), true);
runTest('Массивы (разные элементы)', deepEqual([1, 2, 3], [1, 2, 4]), false);
runTest('Массивы (разная длина)', deepEqual([1, 2], [1, 2, 3]), false);
runTest('Массивы (вложенные)', deepEqual([1, [2, 3]], [1, [2, 3]]), true);
runTest('Массив vs объект', deepEqual([1, 2], { 0: 1, 1: 2 }), false);

// Тест 3: Вложенные объекты
const obj1 = { a: 1, b: { c: 2, d: [3, 4] } };
const obj2 = { a: 1, b: { c: 2, d: [3, 4] } };
const obj3 = { a: 1, b: { c: 2, d: [3, 5] } };
runTest('Вложенные объекты (равны)', deepEqual(obj1, obj2), true);
runTest('Вложенные объекты (разные)', deepEqual(obj1, obj3), false);

// Тест 4: Циклические ссылки
const cycle1: any = { name: 'cycle' };
cycle1.self = cycle1;
const cycle2: any = { name: 'cycle' };
cycle2.self = cycle2;
const cycle3: any = { name: 'cycle' };
cycle3.self = { name: 'other' };
runTest('Циклические ссылки (равные)', deepEqual(cycle1, cycle2), true);
runTest('Циклические ссылки (разные)', deepEqual(cycle1, cycle3), false);
// Сравнение объекта с самим собой
runTest('Объект с самим собой (цикл)', deepEqual(cycle1, cycle1), true);

// Тест 5: Разные типы
runTest('Разные типы (объект и массив)', deepEqual({ a: 1 }, [1]), false);
runTest('Разные типы (число и объект)', deepEqual(42, { value: 42 }), false);
runTest('Разные типы (Date и строка)', deepEqual(new Date('2023-01-01'), '2023-01-01'), false);
}

{
// Пример 1: Простые объекты
const user1 = { id: 1, name: 'Alice', tags: ['admin', 'user'] };
const user2 = { id: 1, name: 'Alice', tags: ['admin', 'user'] };
console.log('Пользователи равны?', deepEqual(user1, user2)); // true

// Пример 2: Объекты с функциями 
const objWithMethod = { x: 10, fn: () => 42 };
const sameObjWithMethod = { x: 10, fn: () => 42 };
console.log('Объекты с функциями (разные функции)', deepEqual(objWithMethod, sameObjWithMethod)); 

// Пример 3: Смешанные структуры
const data1 = {
  status: 'ok',
  items: [1, { id: 2 }, null],
  meta: { version: 1.0 }
};
const data2 = {
  status: 'ok',
  items: [1, { id: 2 }, null],
  meta: { version: 1.0 }
};
console.log('Сложные данные равны?', deepEqual(data1, data2)); // true

// Пример 4: Циклическая структура
const graph1: any = { value: 1 };
graph1.next = graph1;
const graph2: any = { value: 1 };
graph2.next = graph2;
console.log('Циклические графы равны?', deepEqual(graph1, graph2)); // true

// Пример 5: Разные типы данных вместе
console.log('Сравнение Map:', deepEqual(new Map(), new Map())); 
}
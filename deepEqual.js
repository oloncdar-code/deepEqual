// Базовый класс Comparator
class Comparator {
  canHandle(value) {
    return false; 
  }
  
  compare(a, b, engine) {
    throw new Error("Метод compare должен быть реализован");
  }
}

// Для примитивов
class PrimitiveComparator extends Comparator {
  canHandle(value) {
    // Примитивы: числа, строки, boolean, null, undefined, символы
    return !(typeof value === "object" && value !== null);
    // или более явно: 
    // return value === null || typeof value !== "object";
  }
  
  compare(a, b, engine) {
    return a === b;
  }
}

// Для массивов
class ArrayComparator extends Comparator {
  canHandle(value) {
    return Array.isArray(value);
  }
  
  compare(a, b, engine) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!engine.deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
}

// Для объектов
class ObjectComparator extends Comparator {
  canHandle(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  
  compare(a, b, engine) {
    if (typeof b !== "object" || b === null || Array.isArray(b)) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
      if (!b.hasOwnProperty(key)) return false;
      if (!engine.deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
}

// Основной класс DeepEqualEngine
class DeepEqualEngine {
  constructor() {
    this.comparators = [
      new PrimitiveComparator(),
      new ArrayComparator(),
      new ObjectComparator(),
    ];
    this.visited = new WeakSet(); // для отслеживания циклических ссылок
  }

  deepEqual(a, b) {
    // Проверка на циклические ссылки
    if (typeof a === "object" && a !== null) {
      if (this.visited.has(a)) {
        return a === b;
      }
      this.visited.add(a);
    }

    // Поиск подходящего компаратора
    const comparator = this.findComparator(a);
    if (!comparator) {
      throw new Error(`Не найден компаратор для типа: ${typeof a}`);
    }

    return comparator.compare(a, b, this);
  }

  findComparator(value) {
    return this.comparators.find((comp) => comp.canHandle(value));
  }

  // Метод для добавления новых компараторов
  addComparator(comparator) {
    if (!(comparator instanceof Comparator)) {
      throw new Error("Компаратор должен наследоваться от класса Comparator");
    }
    this.comparators.unshift(comparator); 
  }
}

// Использование 
const engine = new DeepEqualEngine();

// Проверка 1: Простые объекты
const obj1 = { a: 1, b: [2, 3], c: { d: 4 } };
const obj2 = { a: 1, b: [2, 3], c: { d: 4 } };
console.log("Проверка 1:", engine.deepEqual(obj1, obj2)); // true

// Проверка 2: Разные объекты
const obj3 = { a: 1, b: [2, 3], c: { d: 5 } };
console.log("Проверка 2:", engine.deepEqual(obj1, obj3)); // false

// Проверка 3: Примитивы
console.log("Проверка 3:", engine.deepEqual(5, 5)); // true
console.log("Проверка 4:", engine.deepEqual(5, "5")); // false

// Проверка 4: Массивы
console.log("Проверка 5:", engine.deepEqual([1, 2, 3], [1, 2, 3])); // true
console.log("Проверка 6:", engine.deepEqual([1, 2, 3], [1, 2, 4])); // false

// Проверка 5: Циклические ссылки (не вызовет ошибку)
const cycle1 = {};
cycle1.self = cycle1;
const cycle2 = {};
cycle2.self = cycle2;
console.log("Проверка 7 (циклы):", engine.deepEqual(cycle1, cycle2)); // true

// Пример 6: null и undefined
console.log("Проверка 8:", engine.deepEqual(null, null)); // true
console.log("Проверка 9:", engine.deepEqual(undefined, undefined)); // true
console.log("Проверка 10:", engine.deepEqual(null, undefined)); // false
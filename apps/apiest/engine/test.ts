function solve(a: number) {
  if (a !== 2 && a % 2 === 0) {
    // numar par
    return 'YES';
  } else {
    // numar impar
    return 'NO';
  }
}

function min(a: number, b: number) {
  return a < b ? a : b;
}

// function max(a: number, b: number) {
//   return a > b ? a : b;
// }

console.log(min(4, 5));

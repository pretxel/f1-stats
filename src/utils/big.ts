export function add(a: number | string, b: number | string): number {
  const aStr = a.toString();
  const bStr = b.toString();

  const aDec = aStr.includes('.') ? aStr.split('.')[1].length : 0;
  const bDec = bStr.includes('.') ? bStr.split('.')[1].length : 0;
  const decimals = Math.max(aDec, bDec);

  const factor = BigInt(10) ** BigInt(decimals);

  const [aInt, aFrac = ''] = aStr.split('.');
  const [bInt, bFrac = ''] = bStr.split('.');

  const aBig = BigInt(aInt) * factor + BigInt((aFrac.padEnd(decimals, '0')).slice(0, decimals));
  const bBig = BigInt(bInt) * factor + BigInt((bFrac.padEnd(decimals, '0')).slice(0, decimals));

  const sum = aBig + bBig;

  const intPart = sum / factor;
  const fracPart = sum % factor;

  const fracStr = fracPart.toString().padStart(decimals, '0').replace(/0+$/, '');

  return fracStr ? parseFloat(`${intPart.toString()}.${fracStr}`) : Number(intPart);
}

export default { add };

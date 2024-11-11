const ranges = [
  { divider: 1e9, suffix: "b" },
  { divider: 1e6, suffix: "m" },
  { divider: 1e3, suffix: "k" },
];

export function formatNumber(n: number) {
  for (let i = 0; i < ranges.length; i++) {
    const { divider, suffix } = ranges[i];
    if (n >= divider) {
      return `${n / divider}${suffix}`;
    }
  }
  return n.toString();
  // console.log(n.toString())
}



export function formatNumber2(n: number) {
  for (let i = 0; i < ranges.length; i++) {
    const { divider, suffix } = ranges[i];
    if (n >= divider) {
      return `${n / divider}${suffix}`;
    }
  }
  return (n.toString() * 1000);

}

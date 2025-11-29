type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export type DotPathsLeafOnly<T, D extends number = 6> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & (string | number)]: T[K] extends object
          ? Join<K, DotPathsLeafOnly<T[K], Prev[D]>>
          : K;
      }[keyof T & (string | number)]
    : never;

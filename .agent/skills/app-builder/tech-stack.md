// The main type definitions. Packages that do not want to pollute the global
// scope with Trusted Types (e.g. libraries whose users may not be using Trusted
// Types) can import the types directly from 'trusted-types/lib'.

export type FnNames = keyof TrustedTypePolicyOptions;
export type Args<Options extends TrustedTypePolicyOptions, K extends FnNames> = Parameters<NonNullable<Options[K]>>;

export class TrustedHTML {
    private constructor(); // To prevent instantiting with 'new'.
    private brand: true; // To prevent structural typing.
}

export class TrustedScript {
    private constructor(); // To prevent instantiting with 'new'.
    private brand: true; // To prevent structural typing.
}

export class TrustedScriptURL {
    private constructor(); // To prevent instantiting with 'new'.
    private brand: true; // To prevent structural typing.
}

export abstract cla
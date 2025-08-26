/// <reference types="vite/client" />

declare module '@capacitor/preferences' {
  export interface GetResult {
    value: string | null;
  }
  
  export interface GetOptions {
    key: string;
  }
  
  export interface SetOptions {
    key: string;
    value: string;
  }
  
  export class Preferences {
    static get(options: GetOptions): Promise<GetResult>;
    static set(options: SetOptions): Promise<void>;
    static remove(options: { key: string }): Promise<void>;
    static clear(): Promise<void>;
    static keys(): Promise<{ keys: string[] }>;
  }
}
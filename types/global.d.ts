export {};

declare global {
  interface Window {
    $sleek: any; // Você pode especificar um tipo mais adequado, se souber
    SLEEK_PRODUCT_ID: number;
  }
}

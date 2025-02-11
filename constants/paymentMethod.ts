export enum PAYMENT_METHOD {
  CASH = 'cash',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}

export const PAYMENT_METHOD_OPTIONS: Array<{ label: string, value: PAYMENT_METHOD }> = [
  { label: 'Espèces', value: PAYMENT_METHOD.CASH },
  { label: 'Mobile Money', value: PAYMENT_METHOD.MOBILE_MONEY },
  { label: 'Virement', value: PAYMENT_METHOD.BANK_TRANSFER },
]

export const PAYMENT_METHOD_OPTIONS_MAP: Record<PAYMENT_METHOD, string> = {
  [PAYMENT_METHOD.CASH]: 'cash',
  [PAYMENT_METHOD.MOBILE_MONEY]: 'mobile_money',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'bank_transfer',
}

export const PAYMENT_METHOD_FROM_STRING_OPTIONS_MAP: Record<string, PAYMENT_METHOD> = {
  cash: PAYMENT_METHOD.CASH,
  mobile_money: PAYMENT_METHOD.MOBILE_MONEY,
  bank_transfer: PAYMENT_METHOD.BANK_TRANSFER,
}

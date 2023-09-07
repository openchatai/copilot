// these functions are used to format numbers to currency and thousands

export const formatValue = (value: number): string => Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
    notation: 'compact',
}).format(value)

export const formatThousands = (value: number): string => Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 3,
    notation: 'compact',
}).format(value)

export const formatter = new Intl.NumberFormat('en-US')

export const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
})

const savedAtFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
})

export const normalizeSearch = (value: string) => value.toLowerCase().trim()

export const formatNameList = (values: string[]) =>
  values
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(', ')

export const formatSavedAt = (isoDate: string) => {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return 'Not saved yet'
  }

  return savedAtFormatter.format(date)
}

const currency = import.meta.env.VITE_APP_CURRENCY || "INR";

const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

export const formatMoney = (amount: number): string => moneyFormat.format(amount);

export const formatDate = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatTime = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "—";

/** Today as YYYY-MM-DD in the viewer's timezone, for date inputs. */
export const todayInputValue = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

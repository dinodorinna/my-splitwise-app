export const formatBaht = (value: number) =>
    `฿${Math.abs(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const startWithUpperCase = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

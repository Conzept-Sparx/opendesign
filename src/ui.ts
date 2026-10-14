const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code: number) => (s: string) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
export const bold = wrap(1);
export const dim = wrap(2);
export const red = wrap(31);
export const green = wrap(32);
export const yellow = wrap(33);
export const cyan = wrap(36);
export const log = (s = "") => console.log(s);

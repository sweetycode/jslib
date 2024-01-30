export async function sha1(str: string): Promise<string> {
    const bytes = new TextEncoder().encode(str);
    const buffer = await crypto.subtle.digest("SHA-1", bytes);
    const array = Array.from(new Uint8Array(buffer));
    return array.map((b) => b.toString(16)) // deliberate remove padding 0
        .join("");
}

<template>
    <div class="h-full flex flex-col overflow-hidden">
        <!-- Header -->
        <header
            class="flex items-center justify-between px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <span
                class="text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-none"
            >
                🔑 JWT Decoder &amp; Encoder
            </span>

            <!-- Section tabs -->
            <div
                class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs font-medium"
            >
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        section === 'decode'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="section = 'decode'"
                >
                    Decode
                </button>
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        section === 'encode'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="section = 'encode'"
                >
                    Encode
                </button>
            </div>
        </header>

        <!-- ── DECODE ─────────────────────────────────────────────────────── -->
        <div
            v-if="section === 'decode'"
            class="flex-1 overflow-y-auto flex flex-col gap-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-950"
        >
            <!-- Token input -->
            <div class="flex flex-col gap-1.5">
                <label
                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                    Encoded Token
                </label>
                <textarea
                    v-model="rawToken"
                    rows="4"
                    class="w-full p-3 font-mono text-xs sm:text-sm leading-relaxed rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-600"
                    spellcheck="false"
                    placeholder="Paste a JWT token here…"
                />
            </div>

            <!-- Colorised token preview -->
            <div
                v-if="tokenParts.length === 3 && rawToken.trim()"
                class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
            >
                <p class="font-mono text-xs break-all leading-relaxed">
                    <span class="text-violet-600 dark:text-violet-400">{{
                        tokenParts[0]
                    }}</span
                    ><span class="text-gray-400">.</span
                    ><span class="text-emerald-600 dark:text-emerald-400">{{
                        tokenParts[1]
                    }}</span
                    ><span class="text-gray-400">.</span
                    ><span class="text-amber-600 dark:text-amber-400">{{
                        tokenParts[2]
                    }}</span>
                </p>
            </div>

            <!-- Decode error -->
            <div
                v-if="decodeError"
                class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-4 h-4 shrink-0"
                />
                {{ decodeError }}
            </div>

            <!-- Results grid -->
            <div v-if="decoded" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Card 1: Header -->
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span
                            class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400"
                            >Header</span
                        >
                        <UBadge
                            :label="decoded.header.alg || 'unknown'"
                            color="violet"
                            variant="subtle"
                            size="xs"
                        />
                        <UBadge
                            v-if="decoded.header.typ"
                            :label="decoded.header.typ"
                            color="gray"
                            variant="subtle"
                            size="xs"
                        />
                    </div>
                    <div
                        class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-auto"
                    >
                        <pre
                            class="p-3 font-mono text-xs leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre"
                            v-html="
                                highlightJson(
                                    JSON.stringify(decoded.header, null, 2),
                                )
                            "
                        />
                    </div>
                </div>

                <!-- Card 2: Payload -->
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span
                            class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
                            >Payload</span
                        >
                        <UBadge
                            v-if="expiryInfo"
                            :label="expiryInfo.label"
                            :color="expiryInfo.color"
                            variant="subtle"
                            size="xs"
                        />
                        <UBadge
                            v-else-if="decoded"
                            label="No Expiry"
                            color="gray"
                            variant="subtle"
                            size="xs"
                        />
                    </div>
                    <div
                        class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-auto"
                    >
                        <pre
                            class="p-3 font-mono text-xs leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre"
                            v-html="
                                highlightJson(
                                    JSON.stringify(decoded.payload, null, 2),
                                )
                            "
                        />
                    </div>
                    <!-- Claims table -->
                    <div
                        v-if="claims.length"
                        class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800"
                    >
                        <div
                            v-for="claim in claims"
                            :key="claim.key"
                            class="flex items-start gap-2 px-3 py-2"
                        >
                            <span
                                class="font-mono text-xs text-gray-400 dark:text-gray-500 shrink-0 w-20"
                                >{{ claim.key }}</span
                            >
                            <span
                                class="text-xs text-gray-700 dark:text-gray-300 break-all"
                                >{{ claim.value }}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Card 3: Signature -->
                <div class="flex flex-col gap-2">
                    <span
                        class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                        >Signature</span
                    >
                    <div
                        class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                    >
                        <p
                            class="font-mono text-xs text-amber-600 dark:text-amber-400 break-all leading-relaxed"
                        >
                            {{ tokenParts[2] }}
                        </p>
                    </div>

                    <!-- Verify signature -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs text-gray-500 dark:text-gray-400">
                            Verify signature
                            <span class="opacity-60">(HMAC only)</span>
                        </label>
                        <input
                            v-model="verifySecret"
                            type="text"
                            placeholder="Enter secret…"
                            class="w-full font-mono text-xs outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2"
                        />
                        <div class="flex items-center gap-2">
                            <UButton
                                size="xs"
                                color="primary"
                                variant="soft"
                                @click="verifySignature"
                            >
                                Verify
                            </UButton>
                            <UBadge
                                v-if="verifyResult === true"
                                label="✓ Valid"
                                color="green"
                                variant="subtle"
                                size="xs"
                            />
                            <UBadge
                                v-if="verifyResult === false"
                                label="✗ Invalid"
                                color="red"
                                variant="subtle"
                                size="xs"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── ENCODE ─────────────────────────────────────────────────────── -->
        <div
            v-if="section === 'encode'"
            class="flex-1 overflow-y-auto flex flex-col gap-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-950"
        >
            <!-- Two-column editors -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Header JSON -->
                <div class="flex flex-col gap-1.5">
                    <label
                        class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400"
                    >
                        Header
                    </label>
                    <textarea
                        v-model="encodeHeader"
                        rows="6"
                        spellcheck="false"
                        class="w-full font-mono outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                </div>

                <!-- Payload JSON -->
                <div class="flex flex-col gap-1.5">
                    <label
                        class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
                    >
                        Payload
                    </label>
                    <textarea
                        v-model="encodePayload"
                        rows="6"
                        spellcheck="false"
                        class="w-full font-mono outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                </div>
            </div>

            <!-- Settings row -->
            <div class="flex flex-wrap items-end gap-3">
                <!-- Secret input -->
                <div class="flex flex-col gap-1 flex-1 min-w-40">
                    <label
                        class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                        Secret / Key
                    </label>
                    <input
                        v-model="encodeSecret"
                        type="text"
                        class="font-mono outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <!-- Algorithm select -->
                <div class="flex flex-col gap-1">
                    <label
                        class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                        Algorithm
                    </label>
                    <select
                        v-model="encodeAlg"
                        class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm outline-none cursor-pointer"
                    >
                        <option>HS256</option>
                        <option>HS384</option>
                        <option>HS512</option>
                    </select>
                </div>

                <!-- Generate button -->
                <UButton
                    color="primary"
                    icon="i-heroicons-bolt"
                    @click="generateJwt"
                >
                    Generate JWT
                </UButton>
            </div>

            <!-- Encode error -->
            <div
                v-if="encodeError"
                class="flex items-start gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span>{{ encodeError }}</span>
            </div>

            <!-- Generated token output -->
            <div v-if="generatedToken" class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <label
                        class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                        Generated Token
                    </label>
                    <UButton
                        size="xs"
                        variant="ghost"
                        color="gray"
                        @click="copyGenerated"
                    >
                        {{ copyGenLabel }}
                    </UButton>
                </div>

                <!-- Colorised preview -->
                <div
                    v-if="generatedTokenParts.length === 3"
                    class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                >
                    <p class="font-mono text-xs break-all leading-relaxed">
                        <span class="text-violet-600 dark:text-violet-400">{{
                            generatedTokenParts[0]
                        }}</span
                        ><span class="text-gray-400">.</span
                        ><span class="text-emerald-600 dark:text-emerald-400">{{
                            generatedTokenParts[1]
                        }}</span
                        ><span class="text-gray-400">.</span
                        ><span class="text-amber-600 dark:text-amber-400">{{
                            generatedTokenParts[2]
                        }}</span>
                    </p>
                </div>

                <!-- Full token (readonly textarea) -->
                <textarea
                    :value="generatedToken"
                    readonly
                    rows="4"
                    spellcheck="false"
                    class="w-full font-mono outline-none focus:ring-2 focus:ring-primary-500 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm resize-none"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "JWT Decoder & Encoder" });

// ── Base64URL helpers ─────────────────────────────────────────────────────────

const b64UrlDecode = (s: string): string => {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(b64 + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
};

const b64UrlEncode = (s: string): string => {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const b64UrlEncodeBytes = (bytes: Uint8Array): string => {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

// ── JSON syntax highlighter ───────────────────────────────────────────────────

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightJson = (json: string) =>
    escapeHtml(json).replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (m) => {
            if (/^"/.test(m))
                return /:$/.test(m)
                    ? `<span class="json-key">${m}</span>`
                    : `<span class="json-string">${m}</span>`;
            if (/true|false/.test(m))
                return `<span class="json-bool">${m}</span>`;
            if (/null/.test(m)) return `<span class="json-null">${m}</span>`;
            return `<span class="json-number">${m}</span>`;
        },
    );

// ── DECODE state ──────────────────────────────────────────────────────────────

const section = ref<"decode" | "encode">("decode");
const rawToken = ref("");
const verifySecret = ref("");
const verifyResult = ref<boolean | null>(null);

watch(rawToken, () => {
    verifyResult.value = null;
});

const tokenParts = computed(() => rawToken.value.trim().split("."));

const decodeError = ref("");
const decoded = computed(() => {
    const raw = rawToken.value.trim();
    if (!raw) {
        decodeError.value = "";
        return null;
    }
    const parts = raw.split(".");
    if (parts.length !== 3) {
        decodeError.value =
            "Invalid JWT structure: expected 3 dot-separated parts.";
        return null;
    }
    try {
        const header = JSON.parse(b64UrlDecode(parts[0]));
        const payload = JSON.parse(b64UrlDecode(parts[1]));
        decodeError.value = "";
        return { header, payload };
    } catch (e: any) {
        decodeError.value = `Failed to decode: ${e.message}`;
        return null;
    }
});

const expiryInfo = computed(() => {
    const exp = decoded.value?.payload?.exp;
    if (exp === undefined || exp === null) return null;
    if (Date.now() / 1000 > exp)
        return { label: "Expired", color: "red" as any };
    return { label: "Valid", color: "green" as any };
});

const claims = computed(() => {
    const payload = decoded.value?.payload;
    if (!payload) return [];
    const timeFields = new Set(["iat", "exp", "nbf"]);
    const fieldNames: Record<string, string> = {
        sub: "Subject",
        iss: "Issuer",
        aud: "Audience",
        jti: "Token ID",
        iat: "Issued At",
        exp: "Expires At",
        nbf: "Not Before",
    };
    return Object.entries(fieldNames)
        .filter(([key]) => payload[key] !== undefined)
        .map(([key, label]) => ({
            key: label,
            value: timeFields.has(key)
                ? new Date(payload[key] * 1000).toLocaleString()
                : String(payload[key]),
        }));
});

const verifySignature = async () => {
    if (!decoded.value || !verifySecret.value) return;
    const parts = rawToken.value.trim().split(".");
    const alg = decoded.value.header.alg as string;
    const hashMap: Record<string, string> = {
        HS256: "SHA-256",
        HS384: "SHA-384",
        HS512: "SHA-512",
    };
    const hash = hashMap[alg];
    if (!hash) {
        verifyResult.value = false;
        return;
    }
    try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(verifySecret.value),
            { name: "HMAC", hash },
            false,
            ["verify"],
        );
        const b64 = parts[2].replace(/-/g, "+").replace(/_/g, "/");
        const pad = "=".repeat((4 - (b64.length % 4)) % 4);
        const binaryStr = atob(b64 + pad);
        const sigBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++)
            sigBytes[i] = binaryStr.charCodeAt(i);
        verifyResult.value = await crypto.subtle.verify(
            "HMAC",
            key,
            sigBytes,
            enc.encode(`${parts[0]}.${parts[1]}`),
        );
    } catch {
        verifyResult.value = false;
    }
};

// ── ENCODE state ──────────────────────────────────────────────────────────────

const encodeHeader = ref(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
const encodePayload = ref(
    JSON.stringify(
        {
            sub: "1234567890",
            name: "John Doe",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
        },
        null,
        2,
    ),
);
const encodeSecret = ref("your-256-bit-secret");
const encodeAlg = ref("HS256");
const generatedToken = ref("");
const encodeError = ref("");

watch(encodeAlg, (alg) => {
    try {
        const h = JSON.parse(encodeHeader.value);
        h.alg = alg;
        encodeHeader.value = JSON.stringify(h, null, 2);
    } catch {}
});

const generatedTokenParts = computed(() => generatedToken.value.split("."));

const generateJwt = async () => {
    encodeError.value = "";
    generatedToken.value = "";
    try {
        const header = JSON.parse(encodeHeader.value);
        const payload = JSON.parse(encodePayload.value);
        const alg = encodeAlg.value;
        const hashMap: Record<string, string> = {
            HS256: "SHA-256",
            HS384: "SHA-384",
            HS512: "SHA-512",
        };
        const hash = hashMap[alg];
        if (!hash) throw new Error(`Unsupported algorithm: ${alg}`);
        const h = b64UrlEncode(JSON.stringify(header));
        const p = b64UrlEncode(JSON.stringify(payload));
        const data = `${h}.${p}`;
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            enc.encode(encodeSecret.value),
            { name: "HMAC", hash },
            false,
            ["sign"],
        );
        const sigBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            enc.encode(data),
        );
        const sig = b64UrlEncodeBytes(new Uint8Array(sigBuffer));
        generatedToken.value = `${data}.${sig}`;
    } catch (e: any) {
        encodeError.value = e.message;
    }
};

// ── Copy ──────────────────────────────────────────────────────────────────────

const copyGenLabel = ref("Copy");
const copyGenerated = async () => {
    await navigator.clipboard.writeText(generatedToken.value);
    copyGenLabel.value = "Copied!";
    setTimeout(() => (copyGenLabel.value = "Copy"), 2000);
};
</script>

<style>
.json-key {
    @apply text-violet-600 dark:text-violet-400;
}
.json-string {
    @apply text-green-600  dark:text-green-400;
}
.json-number {
    @apply text-blue-600   dark:text-blue-400;
}
.json-bool {
    @apply text-amber-600  dark:text-amber-400;
}
.json-null {
    @apply text-red-500    dark:text-red-400;
}
</style>

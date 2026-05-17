<template>
    <div class="h-full flex flex-col overflow-hidden">
        <!-- Header -->
        <header
            class="flex items-center justify-between px-3 sm:px-4 h-10 sm:h-11 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <span
                class="text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-none"
            >
                <UIcon
                    name="i-heroicons-paper-airplane"
                    class="w-5 h-5 mr-1 inline-block align-text-bottom"
                />
                API Tester
            </span>
        </header>

        <!-- URL Bar -->
        <div
            class="shrink-0 px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center gap-2">
                <!-- Method -->
                <USelect
                    v-model="method"
                    :options="[...METHODS]"
                    size="sm"
                    :ui="{
                        base:
                            'font-mono font-semibold cursor-pointer ' +
                            METHOD_COLORS[method],
                    }"
                />

                <!-- URL input -->
                <input
                    v-model="url"
                    type="url"
                    class="flex-1 min-w-0 font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://api.example.com/endpoint"
                    spellcheck="false"
                    @keydown.enter="sendRequest"
                />

                <!-- Send button -->
                <UButton
                    color="primary"
                    size="sm"
                    :loading="loading"
                    :disabled="!url.trim()"
                    icon="i-heroicons-paper-airplane"
                    @click="sendRequest"
                >
                    <span class="hidden sm:inline">Send</span>
                </UButton>
            </div>
        </div>

        <!-- Request config tabs -->
        <div
            class="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        >
            <!-- Tab bar -->
            <div
                class="flex items-center px-3 gap-0.5 border-b border-gray-100 dark:border-gray-800"
            >
                <button
                    v-for="tab in requestTabs"
                    :key="tab.key"
                    class="px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px"
                    :class="
                        requestTab === tab.key
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    "
                    @click="requestTab = tab.key"
                >
                    {{ tab.label }}
                    <span
                        v-if="tab.count"
                        class="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    >
                        {{ tab.count }}
                    </span>
                </button>
            </div>

            <!-- Tab content (fixed height, scrollable) -->
            <div class="max-h-44 overflow-y-auto">
                <!-- Params -->
                <div v-if="requestTab === 'params'" class="p-2">
                    <KeyValueRows
                        v-model="params"
                        key-placeholder="param"
                        value-placeholder="value"
                    />
                </div>

                <!-- Headers -->
                <div v-if="requestTab === 'headers'" class="p-2">
                    <KeyValueRows
                        v-model="reqHeaders"
                        key-placeholder="header"
                        value-placeholder="value"
                    />
                </div>

                <!-- Body -->
                <div v-if="requestTab === 'body'">
                    <!-- Body type bar -->
                    <div
                        class="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                        <button
                            v-for="bt in BODY_TYPES"
                            :key="bt.value"
                            class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                            :class="
                                bodyType === bt.value
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            "
                            :disabled="!hasBody"
                            @click="bodyType = bt.value"
                        >
                            {{ bt.label }}
                        </button>
                        <span
                            v-if="!hasBody"
                            class="text-xs text-gray-400 dark:text-gray-600 ml-2 italic"
                        >
                            {{ method }} requests don't have a body
                        </span>
                    </div>
                    <!-- Body content -->
                    <div v-if="hasBody">
                        <textarea
                            v-if="bodyType === 'json' || bodyType === 'text'"
                            v-model="bodyContent"
                            rows="5"
                            class="w-full p-3 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none resize-none border-none"
                            spellcheck="false"
                            :placeholder="
                                bodyType === 'json'
                                    ? jsonBodyPlaceholder
                                    : 'Request body…'
                            "
                        />
                        <div v-else-if="bodyType === 'form'" class="p-2">
                            <KeyValueRows
                                v-model="formBody"
                                key-placeholder="field"
                                value-placeholder="value"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error / CORS banner -->
        <Transition
            enter-active-class="transition-all duration-150"
            leave-active-class="transition-all duration-150"
            enter-from-class="opacity-0 -translate-y-1"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="reqError"
                class="shrink-0 flex items-start gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span>{{ reqError }}</span>
            </div>
        </Transition>

        <!-- Response pane -->
        <div
            class="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950"
        >
            <!-- Response header row -->
            <div
                class="shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            >
                <!-- Status / loading -->
                <template v-if="loading">
                    <UIcon
                        name="i-heroicons-arrow-path"
                        class="w-4 h-4 animate-spin text-primary-500"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400"
                        >Sending…</span
                    >
                </template>
                <template v-else-if="response">
                    <UBadge
                        :label="`${response.status} ${response.statusText}`"
                        :color="statusColor(response.status)"
                        variant="subtle"
                        size="sm"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400"
                        >{{ response.time }}ms</span
                    >
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{
                        formatSize(response.size)
                    }}</span>
                </template>
                <template v-else>
                    <span
                        class="text-xs text-gray-400 dark:text-gray-600 italic"
                        >No response yet</span
                    >
                </template>

                <!-- Response view tabs -->
                <div
                    v-if="response"
                    class="ml-auto flex items-center gap-0.5 text-xs font-medium"
                >
                    <button
                        class="px-2.5 py-1 rounded-md transition-colors"
                        :class="
                            responseTab === 'body'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        "
                        @click="responseTab = 'body'"
                    >
                        Body
                    </button>
                    <button
                        class="px-2.5 py-1 rounded-md transition-colors"
                        :class="
                            responseTab === 'headers'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        "
                        @click="responseTab = 'headers'"
                    >
                        Headers
                        <span class="ml-1 opacity-60">{{
                            Object.keys(response.headers).length
                        }}</span>
                    </button>
                </div>

                <!-- Copy response -->
                <UTooltip
                    v-if="response && responseTab === 'body'"
                    :text="copyLabel"
                >
                    <UButton
                        icon="i-heroicons-clipboard-document"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        @click="copyResponse"
                    >
                        <span class="hidden sm:inline">{{ copyLabel }}</span>
                    </UButton>
                </UTooltip>
            </div>

            <!-- Response body -->
            <div class="flex-1 overflow-auto">
                <!-- Loading spinner -->
                <div
                    v-if="loading"
                    class="flex items-center justify-center h-full"
                >
                    <div
                        class="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-600"
                    >
                        <UIcon
                            name="i-heroicons-arrow-path"
                            class="w-8 h-8 animate-spin"
                        />
                        <span class="text-sm">Waiting for response…</span>
                    </div>
                </div>

                <!-- Body tab -->
                <div v-else-if="response && responseTab === 'body'">
                    <pre
                        v-if="response.body"
                        class="p-3 sm:p-4 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words"
                        v-html="highlightedBody"
                    />
                    <div
                        v-else
                        class="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-600 select-none italic"
                    >
                        Empty response body
                    </div>
                </div>

                <!-- Headers tab -->
                <div
                    v-else-if="response && responseTab === 'headers'"
                    class="divide-y divide-gray-100 dark:divide-gray-800"
                >
                    <div
                        v-for="(val, key) in response.headers"
                        :key="key"
                        class="flex items-start gap-3 px-3 sm:px-4 py-2.5 text-xs hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                        <span
                            class="font-mono font-semibold text-violet-600 dark:text-violet-400 w-48 shrink-0 break-all"
                            >{{ key }}</span
                        >
                        <span
                            class="font-mono text-gray-700 dark:text-gray-300 break-all"
                            >{{ val }}</span
                        >
                    </div>
                </div>

                <!-- Empty state -->
                <div
                    v-else-if="!loading && !response && !reqError"
                    class="flex flex-col items-center justify-center h-full gap-3 text-gray-400 dark:text-gray-600 select-none"
                >
                    <UIcon
                        name="i-heroicons-paper-airplane"
                        class="w-10 h-10 opacity-30"
                    />
                    <span class="text-sm">Enter a URL and press Send</span>
                    <div class="flex flex-wrap justify-center gap-2 mt-1">
                        <button
                            v-for="ex in EXAMPLES"
                            :key="ex.url"
                            class="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            @click="loadExample(ex)"
                        >
                            {{ ex.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status bar -->
        <footer
            class="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 text-xs text-gray-500 dark:text-gray-400"
        >
            <div class="flex items-center gap-2 sm:gap-4">
                <span v-if="response">
                    {{
                        response.status >= 200 && response.status < 300
                            ? "✓"
                            : "✗"
                    }}
                    {{ method }}
                    {{ url.length > 40 ? url.slice(0, 40) + "…" : url }}
                </span>
                <span v-if="history.length" class="opacity-60"
                    >{{ history.length }} in history</span
                >
            </div>
            <span class="select-none opacity-60 hidden sm:inline"
                >API Tester</span
            >
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "API Tester" });

// ── Types ──────────────────────────────────────────────────────────────────────

interface KV {
    id: number;
    enabled: boolean;
    key: string;
    value: string;
}
interface ResponseData {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
    size: number;
}

// ── Inline KeyValueRows component ─────────────────────────────────────────────
// Renders a list of key-value rows with add/remove/toggle.
const KeyValueRows = defineComponent({
    props: {
        modelValue: { type: Array as () => KV[], required: true },
        keyPlaceholder: { type: String, default: "key" },
        valuePlaceholder: { type: String, default: "value" },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        let nextId = 100;
        const rows = computed(() => props.modelValue);

        const update = (id: number, field: keyof KV, val: unknown) => {
            emit(
                "update:modelValue",
                rows.value.map((r) =>
                    r.id === id ? { ...r, [field]: val } : r,
                ),
            );
        };
        const remove = (id: number) =>
            emit(
                "update:modelValue",
                rows.value.filter((r) => r.id !== id),
            );
        const add = () =>
            emit("update:modelValue", [
                ...rows.value,
                { id: nextId++, enabled: true, key: "", value: "" },
            ]);

        const UCheckbox = resolveComponent("UCheckbox");

        return () =>
            h("div", { class: "flex flex-col" }, [
                ...rows.value.map((row) =>
                    h(
                        "div",
                        {
                            key: row.id,
                            class: "flex items-center gap-1.5 px-1 py-1",
                        },
                        [
                            // Checkbox
                            h(UCheckbox, {
                                modelValue: row.enabled,
                                "onUpdate:modelValue": (val: boolean) =>
                                    update(row.id, "enabled", val),
                            }),
                            // Key
                            h("input", {
                                value: row.key,
                                placeholder: props.keyPlaceholder,
                                class: "flex-1 min-w-0 font-mono text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500",
                                spellcheck: "false",
                                onInput: (e: Event) =>
                                    update(
                                        row.id,
                                        "key",
                                        (e.target as HTMLInputElement).value,
                                    ),
                            }),
                            // Value
                            h("input", {
                                value: row.value,
                                placeholder: props.valuePlaceholder,
                                class: "flex-1 min-w-0 font-mono text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500",
                                spellcheck: "false",
                                onInput: (e: Event) =>
                                    update(
                                        row.id,
                                        "value",
                                        (e.target as HTMLInputElement).value,
                                    ),
                            }),
                            // Remove
                            h(
                                "button",
                                {
                                    class: "shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors text-lg leading-none",
                                    onClick: () => remove(row.id),
                                },
                                "×",
                            ),
                        ],
                    ),
                ),
                // Add row
                h(
                    "button",
                    {
                        class: "mt-1 ml-1 text-xs text-primary-600 dark:text-primary-400 hover:underline self-start px-1",
                        onClick: add,
                    },
                    "+ Add row",
                ),
            ]);
    },
});

// ── Constants ─────────────────────────────────────────────────────────────────

const METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
] as const;
type Method = (typeof METHODS)[number];

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-emerald-50  dark:bg-emerald-950 text-emerald-700  dark:text-emerald-300",
    POST: "bg-blue-50     dark:bg-blue-950    text-blue-700     dark:text-blue-300",
    PUT: "bg-amber-50    dark:bg-amber-950   text-amber-700    dark:text-amber-300",
    PATCH: "bg-violet-50   dark:bg-violet-950  text-violet-700   dark:text-violet-300",
    DELETE: "bg-red-50      dark:bg-red-950     text-red-700      dark:text-red-300",
    HEAD: "bg-gray-50     dark:bg-gray-800    text-gray-600     dark:text-gray-300",
    OPTIONS:
        "bg-gray-50     dark:bg-gray-800    text-gray-600     dark:text-gray-300",
};

const BODY_TYPES = [
    { value: "none", label: "None" },
    { value: "json", label: "JSON" },
    { value: "form", label: "Form" },
    { value: "text", label: "Text" },
] as const;
type BodyType = (typeof BODY_TYPES)[number]["value"];

const EXAMPLES = [
    {
        label: "GET post",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        body: "",
        bodyType: "none" as BodyType,
    },
    {
        label: "GET users",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/users",
        body: "",
        bodyType: "none" as BodyType,
    },
    {
        label: "POST post",
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        body: '{\n  "title": "Hello",\n  "body": "World",\n  "userId": 1\n}',
        bodyType: "json" as BodyType,
    },
];

// ── State ─────────────────────────────────────────────────────────────────────

let rowId = 0;
const mkRow = (k = "", v = "", on = true): KV => ({
    id: rowId++,
    enabled: on,
    key: k,
    value: v,
});

const method = ref<Method>("GET");
const url = ref("https://jsonplaceholder.typicode.com/posts/1");
const params = ref<KV[]>([mkRow()]);
const reqHeaders = ref<KV[]>([mkRow("Accept", "application/json")]);
const bodyType = ref<BodyType>("none");
const bodyContent = ref("{\n  \n}");
const formBody = ref<KV[]>([mkRow()]);
const requestTab = ref<"params" | "headers" | "body">("params");
const responseTab = ref<"body" | "headers">("body");
const loading = ref(false);
const reqError = ref("");
const response = ref<ResponseData | null>(null);
const copyLabel = ref("Copy");
const history = ref<{ method: string; url: string; status?: number }[]>([]);

const jsonBodyPlaceholder = '{\n  "key": "value"\n}';

const hasBody = computed(
    () => !["GET", "HEAD", "OPTIONS"].includes(method.value),
);

const requestTabs = computed(() => [
    {
        key: "params" as const,
        label: "Params",
        count:
            params.value.filter((r) => r.enabled && r.key.trim()).length || 0,
    },
    {
        key: "headers" as const,
        label: "Headers",
        count:
            reqHeaders.value.filter((r) => r.enabled && r.key.trim()).length ||
            0,
    },
    { key: "body" as const, label: "Body", count: 0 },
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightJson(json: string): string {
    type Token = { start: number; end: number; cls: string };
    const patterns = [
        { re: /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, cls: "" },
        { re: /\b(true|false)\b/g, cls: "api-bool" },
        { re: /\bnull\b/g, cls: "api-null" },
        { re: /-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, cls: "api-number" },
    ];
    const tokens: Token[] = [];
    for (const { re, cls } of patterns) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(json)) !== null) {
            const c =
                cls || (/".*"(\s*:)$/.test(m[0]) ? "api-key" : "api-string");
            tokens.push({ start: m.index, end: m.index + m[0].length, cls: c });
        }
    }
    tokens.sort((a, b) => a.start - b.start || a.end - b.end);
    const clean: Token[] = [];
    let last = 0;
    for (const t of tokens) {
        if (t.start >= last) {
            clean.push(t);
            last = t.end;
        }
    }
    let out = "";
    let pos = 0;
    for (const t of clean) {
        out += escapeHtml(json.slice(pos, t.start));
        out += `<span class="${t.cls}">${escapeHtml(json.slice(t.start, t.end))}</span>`;
        pos = t.end;
    }
    return out + escapeHtml(json.slice(pos));
}

function tryFormatJson(text: string): { formatted: string; isJson: boolean } {
    try {
        return {
            formatted: JSON.stringify(JSON.parse(text), null, 2),
            isJson: true,
        };
    } catch {
        return { formatted: text, isJson: false };
    }
}

const highlightedBody = computed(() => {
    if (!response.value?.body) return "";
    const ct = response.value.headers["content-type"] || "";
    if (ct.includes("json") || ct === "") {
        const { formatted, isJson } = tryFormatJson(response.value.body);
        if (isJson) return highlightJson(formatted);
    }
    return escapeHtml(response.value.body);
});

const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

const statusColor = (s: number) =>
    s >= 500
        ? "red"
        : s >= 400
          ? "orange"
          : s >= 300
            ? "yellow"
            : s >= 200
              ? "green"
              : "gray";

function buildUrlWithParams(base: string, kvs: KV[]): string {
    const active = kvs.filter((p) => p.enabled && p.key.trim());
    if (!active.length) return base;
    const qs = new URLSearchParams(active.map((p) => [p.key.trim(), p.value]));
    return base + (base.includes("?") ? "&" : "?") + qs.toString();
}

// ── Send request ──────────────────────────────────────────────────────────────

const sendRequest = async () => {
    if (!url.value.trim() || loading.value) return;
    loading.value = true;
    reqError.value = "";
    response.value = null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
        // Headers
        const hdrs: Record<string, string> = {};
        reqHeaders.value
            .filter((h) => h.enabled && h.key.trim())
            .forEach((h) => {
                hdrs[h.key.trim()] = h.value;
            });

        // Body
        let body: string | undefined;
        if (hasBody.value && bodyType.value !== "none") {
            if (bodyType.value === "json" || bodyType.value === "text") {
                body = bodyContent.value;
                if (
                    bodyType.value === "json" &&
                    !hdrs["content-type"] &&
                    !hdrs["Content-Type"]
                )
                    hdrs["Content-Type"] = "application/json";
            } else if (bodyType.value === "form") {
                const fd = new URLSearchParams();
                formBody.value
                    .filter((f) => f.enabled && f.key.trim())
                    .forEach((f) => fd.append(f.key.trim(), f.value));
                body = fd.toString();
                if (!hdrs["content-type"] && !hdrs["Content-Type"])
                    hdrs["Content-Type"] = "application/x-www-form-urlencoded";
            }
        }

        const fullUrl = buildUrlWithParams(url.value.trim(), params.value);
        const t0 = performance.now();

        const res = await fetch(fullUrl, {
            method: method.value,
            headers: hdrs,
            body:
                method.value !== "GET" && method.value !== "HEAD"
                    ? body
                    : undefined,
            signal: controller.signal,
        });

        const time = Math.round(performance.now() - t0);
        const text = await res.text();
        const resHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => {
            resHeaders[k] = v;
        });

        response.value = {
            status: res.status,
            statusText: res.statusText || HTTP_STATUS[res.status] || "Unknown",
            headers: resHeaders,
            body: text,
            time,
            size: new Blob([text]).size,
        };

        history.value.unshift({
            method: method.value,
            url: url.value,
            status: res.status,
        });
        if (history.value.length > 20) history.value.pop();
    } catch (e: any) {
        if (e.name === "AbortError") {
            reqError.value = "Request timed out after 30 seconds.";
        } else if (e.message?.includes("fetch")) {
            reqError.value = `Network error: "${e.message}". This is likely a CORS restriction — the server must include Access-Control-Allow-Origin headers to allow browser requests.`;
        } else {
            reqError.value = e.message;
        }
    } finally {
        clearTimeout(timeout);
        loading.value = false;
    }
};

// ── Copy response ─────────────────────────────────────────────────────────────

const copyResponse = async () => {
    if (!response.value?.body) return;
    await navigator.clipboard.writeText(response.value.body).catch(() => {});
    copyLabel.value = "Copied!";
    setTimeout(() => (copyLabel.value = "Copy"), 2000);
};

// ── Load example ──────────────────────────────────────────────────────────────

const loadExample = (ex: (typeof EXAMPLES)[number]) => {
    method.value = ex.method as Method;
    url.value = ex.url;
    bodyType.value = ex.bodyType;
    if (ex.body) {
        bodyContent.value = ex.body;
        requestTab.value = "body";
    }
};

// ── Common HTTP status texts ──────────────────────────────────────────────────

const HTTP_STATUS: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
};
</script>

<style>
.api-key {
    @apply text-violet-600 dark:text-violet-400;
}
.api-string {
    @apply text-green-600  dark:text-green-400;
}
.api-number {
    @apply text-blue-600   dark:text-blue-400;
}
.api-bool {
    @apply text-amber-600  dark:text-amber-400;
}
.api-null {
    @apply text-red-500    dark:text-red-400;
}
</style>

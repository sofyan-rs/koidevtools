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
                    name="i-heroicons-code-bracket-square"
                    class="w-5 h-5 mr-1 inline-block align-text-bottom"
                />
                JSON Formatter
            </span>

            <!-- Mobile tab toggle -->
            <div
                class="flex items-center md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs font-medium"
            >
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        activeTab === 'input'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="activeTab = 'input'"
                >
                    Input
                </button>
                <button
                    class="px-3 py-1 rounded-md transition-colors"
                    :class="
                        activeTab === 'output'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="activeTab = 'output'"
                >
                    Output
                </button>
            </div>
        </header>

        <!-- Toolbar -->
        <div
            class="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 flex-wrap"
        >
            <UTooltip text="Format / Prettify">
                <UButton
                    icon="i-heroicons-sparkles"
                    color="primary"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="formatJson"
                >
                    <span class="hidden sm:inline">Format</span>
                </UButton>
            </UTooltip>

            <UTooltip text="Minify">
                <UButton
                    icon="i-heroicons-arrows-pointing-in"
                    color="gray"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="minifyJson"
                >
                    <span class="hidden sm:inline">Minify</span>
                </UButton>
            </UTooltip>

            <UTooltip text="Validate JSON">
                <UButton
                    icon="i-heroicons-shield-check"
                    color="gray"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="validateJson"
                >
                    <span class="hidden sm:inline">Validate</span>
                </UButton>
            </UTooltip>

            <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1" />

            <UTooltip text="Sort keys A → Z">
                <UButton
                    icon="i-heroicons-bars-arrow-up"
                    color="gray"
                    variant="ghost"
                    size="xs"
                    class="touch-target"
                    @click="sortKeys"
                >
                    <span class="hidden sm:inline">Sort Keys</span>
                </UButton>
            </UTooltip>

            <UTooltip text="Repair JSON (fix trailing commas, comments…)">
                <UButton
                    icon="i-heroicons-wrench-screwdriver"
                    color="gray"
                    variant="ghost"
                    size="xs"
                    class="touch-target"
                    @click="repairJson"
                >
                    <span class="hidden sm:inline">Repair</span>
                </UButton>
            </UTooltip>

            <div class="flex-1" />

            <UTooltip :text="copyLabel">
                <UButton
                    icon="i-heroicons-clipboard-document"
                    color="gray"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    :disabled="!output"
                    @click="copyOutput"
                >
                    <span class="hidden sm:inline">{{ copyLabel }}</span>
                </UButton>
            </UTooltip>

            <UTooltip text="Clear">
                <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="clearAll"
                />
            </UTooltip>
        </div>

        <!-- Error banner -->
        <Transition
            enter-active-class="transition-all duration-200"
            leave-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="error"
                class="flex items-start gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs shrink-0"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span class="font-mono break-all">{{ error }}</span>
            </div>
        </Transition>

        <!-- Two-pane area -->
        <div class="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <!-- Input pane -->
            <div
                class="flex-1 flex flex-col min-w-0"
                :class="isMobile && activeTab !== 'input' ? 'hidden' : 'flex'"
            >
                <div
                    class="px-3 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 select-none"
                >
                    INPUT
                </div>
                <textarea
                    ref="inputRef"
                    v-model="input"
                    class="flex-1 w-full p-3 sm:p-4 resize-none outline-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none"
                    spellcheck="false"
                    placeholder='Paste your JSON here…&#10;&#10;{"name":"JSON Formatter","awesome":true}'
                    @keydown.ctrl.enter.prevent="formatJson"
                    @keydown.meta.enter.prevent="formatJson"
                />
            </div>

            <!-- Divider -->
            <div
                class="hidden md:block w-px bg-gray-200 dark:bg-gray-700 shrink-0"
            />

            <!-- Output pane -->
            <div
                class="flex-1 flex flex-col min-w-0 overflow-hidden"
                :class="isMobile && activeTab !== 'output' ? 'hidden' : 'flex'"
            >
                <div
                    class="px-3 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 select-none flex items-center justify-between"
                >
                    <span>OUTPUT</span>
                    <span
                        v-if="validationStatus"
                        class="flex items-center gap-1"
                        :class="
                            validationStatus === 'valid'
                                ? 'text-green-500'
                                : 'text-red-500'
                        "
                    >
                        <UIcon
                            :name="
                                validationStatus === 'valid'
                                    ? 'i-heroicons-check-circle'
                                    : 'i-heroicons-x-circle'
                            "
                            class="w-3 h-3"
                        />
                        {{
                            validationStatus === "valid"
                                ? "Valid JSON"
                                : "Invalid JSON"
                        }}
                    </span>
                </div>
                <div class="flex-1 overflow-auto">
                    <pre
                        v-if="output"
                        class="p-3 sm:p-4 font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre min-h-full"
                        v-html="highlightedOutput"
                    />
                    <div
                        v-else
                        class="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-600 select-none"
                    >
                        Formatted output will appear here
                    </div>
                </div>
            </div>
        </div>

        <!-- Status bar -->
        <footer
            class="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 text-xs text-gray-500 dark:text-gray-400"
        >
            <div class="flex items-center gap-2 sm:gap-4">
                <span>{{ inputSize }} input</span>
                <span v-if="output">{{ outputSize }} output</span>
                <span v-if="lineCount">{{ lineCount }} lines</span>
            </div>
            <span class="select-none opacity-60 hidden sm:inline"
                >JSON Formatter</span
            >
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "JSON Formatter" });

// Mobile detection
const isMobile = ref(false);
const activeTab = ref<"input" | "output">("input");

const updateMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
    updateMobile();
    window.addEventListener("resize", updateMobile);
});
onUnmounted(() => window.removeEventListener("resize", updateMobile));

// State
const inputRef = ref<HTMLTextAreaElement | null>(null);
const input = ref("");
const output = ref("");
const error = ref("");
const validationStatus = ref<"valid" | "invalid" | "">("");
const copyLabel = ref("Copy");

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse input and return the JS value, or throw with a friendly message. */
const parse = (): unknown => {
    const raw = input.value.trim();
    if (!raw) throw new Error("Input is empty.");
    try {
        return JSON.parse(raw);
    } catch (e: any) {
        throw new Error(e.message);
    }
};

/** Recursively sort object keys alphabetically. */
const sortObjectKeys = (val: unknown): unknown => {
    if (Array.isArray(val)) return val.map(sortObjectKeys);
    if (val !== null && typeof val === "object") {
        return Object.keys(val as object)
            .sort()
            .reduce<Record<string, unknown>>((acc, k) => {
                acc[k] = sortObjectKeys((val as Record<string, unknown>)[k]);
                return acc;
            }, {});
    }
    return val;
};

/** Escape HTML entities so raw JSON can be injected as innerHTML. */
const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Syntax-highlight a formatted JSON string with coloured spans. */
const highlight = (json: string): string =>
    escapeHtml(json).replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            if (/^"/.test(match)) {
                // key vs string value
                return /:$/.test(match)
                    ? `<span class="json-key">${match}</span>`
                    : `<span class="json-string">${match}</span>`;
            }
            if (/true|false/.test(match))
                return `<span class="json-bool">${match}</span>`;
            if (/null/.test(match))
                return `<span class="json-null">${match}</span>`;
            return `<span class="json-number">${match}</span>`;
        },
    );

// ── Computed ─────────────────────────────────────────────────────────────────

const highlightedOutput = computed(() =>
    output.value ? highlight(output.value) : "",
);

const inputSize = computed(() => formatBytes(new Blob([input.value]).size));
const outputSize = computed(() => formatBytes(new Blob([output.value]).size));
const lineCount = computed(() =>
    output.value ? output.value.split("\n").length : 0,
);

const formatBytes = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

// ── Actions ──────────────────────────────────────────────────────────────────

const setOutput = (json: unknown, indent = 2) => {
    output.value = JSON.stringify(json, null, indent);
    error.value = "";
    validationStatus.value = "valid";
    // Switch to output tab on mobile
    if (isMobile.value) activeTab.value = "output";
};

const setError = (msg: string) => {
    error.value = msg;
    validationStatus.value = "invalid";
};

const formatJson = () => {
    try {
        setOutput(parse());
    } catch (e: any) {
        setError(e.message);
    }
};

const minifyJson = () => {
    try {
        setOutput(parse(), 0);
        // Minify uses indent=0 → stringify with no spaces
        output.value = JSON.stringify(parse());
    } catch (e: any) {
        setError(e.message);
    }
};

const validateJson = () => {
    try {
        parse();
        error.value = "";
        validationStatus.value = "valid";
    } catch (e: any) {
        setError(e.message);
    }
};

const sortKeys = () => {
    try {
        setOutput(sortObjectKeys(parse()));
    } catch (e: any) {
        setError(e.message);
    }
};

/**
 * Basic repair: strip JS-style comments and trailing commas, then parse.
 * Handles the most common "almost-valid JSON" patterns.
 */
const repairJson = () => {
    try {
        const raw = input.value
            // Remove single-line comments
            .replace(/\/\/[^\n]*/g, "")
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "")
            // Remove trailing commas before } or ]
            .replace(/,(\s*[}\]])/g, "$1");
        const parsed = JSON.parse(raw);
        input.value = JSON.stringify(parsed, null, 2);
        setOutput(parsed);
    } catch (e: any) {
        setError(`Could not repair: ${e.message}`);
    }
};

const copyOutput = async () => {
    if (!output.value) return;
    try {
        await navigator.clipboard.writeText(output.value);
        copyLabel.value = "Copied!";
    } catch {
        copyLabel.value = "Failed";
    }
    setTimeout(() => (copyLabel.value = "Copy"), 2000);
};

const clearAll = () => {
    input.value = "";
    output.value = "";
    error.value = "";
    validationStatus.value = "";
    inputRef.value?.focus();
};
</script>

<style>
/* JSON syntax highlight colours */
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

/* Larger touch targets on mobile */
@media (max-width: 767px) {
    .touch-target button,
    .touch-target {
        min-width: 36px;
        min-height: 36px;
    }
}
</style>

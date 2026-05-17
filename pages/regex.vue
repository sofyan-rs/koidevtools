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
                    name="i-heroicons-magnifying-glass"
                    class="w-5 h-5 mr-1 inline-block align-text-bottom"
                />
                Regex Tester
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
                        activeTab === 'results'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    "
                    @click="activeTab = 'results'"
                >
                    Results
                </button>
            </div>
        </header>

        <!-- Pattern row -->
        <div
            class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <!-- Regex input -->
            <div
                class="flex items-center flex-1 min-w-0 font-mono text-sm bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-1.5 gap-1 focus-within:ring-2 focus-within:ring-primary-500"
                :class="
                    regexError
                        ? 'border-red-400 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700'
                "
            >
                <span class="text-gray-400 select-none shrink-0">/</span>
                <input
                    v-model="pattern"
                    class="flex-1 min-w-0 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    placeholder="pattern"
                    spellcheck="false"
                    aria-label="Regex pattern"
                />
                <span class="text-gray-400 select-none shrink-0">/</span>
                <!-- Flag toggles -->
                <div class="flex items-center gap-0.5 ml-1 shrink-0">
                    <button
                        v-for="f in FLAG_LIST"
                        :key="f"
                        class="px-1.5 py-0.5 rounded text-xs font-mono font-semibold transition-colors"
                        :class="
                            flags[f]
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        "
                        :title="FLAG_LABELS[f]"
                        @click="flags[f] = !flags[f]"
                    >
                        {{ f }}
                    </button>
                </div>
            </div>

            <!-- Match count -->
            <div class="shrink-0">
                <UBadge
                    v-if="regexError"
                    label="Error"
                    color="red"
                    variant="subtle"
                    size="sm"
                />
                <UBadge
                    v-else-if="pattern && matchCount > 0"
                    :label="`${matchCount} match${matchCount !== 1 ? 'es' : ''}`"
                    color="green"
                    variant="subtle"
                    size="sm"
                />
                <UBadge
                    v-else-if="pattern"
                    label="No matches"
                    color="gray"
                    variant="subtle"
                    size="sm"
                />
            </div>
        </div>

        <!-- Error banner -->
        <Transition
            enter-active-class="transition-all duration-150"
            leave-active-class="transition-all duration-150"
            enter-from-class="opacity-0 -translate-y-1"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="regexError"
                class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-mono shrink-0"
            >
                <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-3.5 h-3.5 shrink-0"
                />
                {{ regexError }}
            </div>
        </Transition>

        <!-- Main editor area -->
        <div class="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <!-- Left pane: test string input -->
            <div
                class="flex-1 flex flex-col min-w-0"
                :class="isMobile && activeTab !== 'input' ? 'hidden' : 'flex'"
            >
                <div
                    class="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 select-none"
                >
                    Test String
                </div>
                <textarea
                    v-model="testString"
                    class="flex-1 w-full p-3 sm:p-4 resize-none outline-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none"
                    spellcheck="false"
                    placeholder="Enter test string here…"
                />
            </div>

            <!-- Divider -->
            <div
                class="hidden md:block w-px bg-gray-200 dark:bg-gray-700 shrink-0"
            />

            <!-- Right pane: results -->
            <div
                class="flex-1 flex flex-col min-w-0 overflow-hidden"
                :class="isMobile && activeTab !== 'results' ? 'hidden' : 'flex'"
            >
                <!-- Right pane tab bar -->
                <div
                    class="flex items-center justify-between px-3 py-1 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 shrink-0"
                >
                    <div class="flex items-center gap-0 text-xs font-medium">
                        <button
                            class="px-3 py-1 rounded-md transition-colors"
                            :class="
                                rightTab === 'match'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            "
                            @click="rightTab = 'match'"
                        >
                            Match
                        </button>
                        <button
                            class="px-3 py-1 rounded-md transition-colors"
                            :class="
                                rightTab === 'replace'
                                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            "
                            @click="rightTab = 'replace'"
                        >
                            Replace
                        </button>
                    </div>
                </div>

                <!-- ── Match tab ───────────────────────────────────────── -->
                <template v-if="rightTab === 'match'">
                    <!-- Highlighted text -->
                    <div
                        class="flex-1 overflow-auto p-3 sm:p-4 bg-white dark:bg-gray-900 min-h-0"
                    >
                        <pre
                            class="font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words"
                            v-html="
                                highlightedText ||
                                '<span class=\'text-gray-400 dark:text-gray-600 select-none\'>Highlighted matches will appear here…</span>'
                            "
                        />
                    </div>

                    <!-- Match list -->
                    <div
                        v-if="matches.length"
                        class="shrink-0 max-h-52 overflow-y-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-800"
                    >
                        <div
                            v-for="(match, i) in matches"
                            :key="i"
                            class="px-3 py-2 text-xs"
                        >
                            <div class="flex items-center gap-2 flex-wrap">
                                <span
                                    class="font-semibold text-primary-600 dark:text-primary-400 shrink-0"
                                >
                                    #{{ i + 1 }}
                                </span>
                                <span
                                    class="font-mono bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded"
                                >
                                    {{ match[0] || "(empty)" }}
                                </span>
                                <span class="text-gray-400 dark:text-gray-500">
                                    index {{ match.index }}–{{
                                        match.index! + match[0].length
                                    }}
                                </span>
                            </div>
                            <!-- Capture groups -->
                            <div
                                v-if="match.length > 1"
                                class="mt-1 flex flex-wrap gap-1.5 pl-6"
                            >
                                <span
                                    v-for="(group, gi) in match.slice(1)"
                                    :key="gi"
                                    class="font-mono text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded"
                                >
                                    ${{ gi + 1 }}: {{ group ?? "undefined" }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <div
                        v-else-if="pattern && !regexError"
                        class="shrink-0 flex items-center justify-center py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-200 dark:border-gray-700"
                    >
                        No matches found
                    </div>
                </template>

                <!-- ── Replace tab ─────────────────────────────────────── -->
                <template v-if="rightTab === 'replace'">
                    <!-- Replacement input -->
                    <div
                        class="shrink-0 px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
                    >
                        <label
                            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5"
                        >
                            Replacement
                            <span
                                class="font-normal normal-case opacity-70 ml-1"
                                >($1 $2… for groups, $& for full match)</span
                            >
                        </label>
                        <input
                            v-model="replacement"
                            class="w-full font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                            placeholder="Replacement string…"
                            spellcheck="false"
                        />
                    </div>
                    <!-- Replaced output -->
                    <div
                        class="flex-1 overflow-auto p-3 sm:p-4 bg-white dark:bg-gray-900"
                    >
                        <pre
                            v-if="testString"
                            class="font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words"
                            >{{ replacedText }}</pre
                        >
                        <span
                            v-else
                            class="text-sm text-gray-400 dark:text-gray-600 select-none"
                        >
                            Replaced output will appear here…
                        </span>
                    </div>
                </template>
            </div>
        </div>

        <!-- Status bar -->
        <footer
            class="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 text-xs text-gray-500 dark:text-gray-400"
        >
            <div class="flex items-center gap-2 sm:gap-4">
                <span v-if="pattern && !regexError">
                    {{ matchCount }}
                    {{ matchCount === 1 ? "match" : "matches" }}
                </span>
                <span v-if="testString">{{ testString.length }} chars</span>
                <span v-if="activeFlags.length" class="font-mono">
                    flags: {{ activeFlags.join("") }}
                </span>
            </div>
            <span class="select-none opacity-60 hidden sm:inline"
                >Regex Tester</span
            >
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "Regex Tester" });

// ── Mobile ────────────────────────────────────────────────────────────────────

const isMobile = ref(false);
const activeTab = ref<"input" | "results">("input");

const updateMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
onMounted(() => {
    updateMobile();
    window.addEventListener("resize", updateMobile);
});
onUnmounted(() => window.removeEventListener("resize", updateMobile));

// ── Constants ─────────────────────────────────────────────────────────────────

const FLAG_LIST = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAG_LIST)[number];

const FLAG_LABELS: Record<Flag, string> = {
    g: "Global — find all matches",
    i: "Case insensitive",
    m: "Multiline — ^ and $ match line boundaries",
    s: "Dot-all — dot matches newlines",
    u: "Unicode",
    y: "Sticky — matches only at lastIndex",
};

// ── State ─────────────────────────────────────────────────────────────────────

const pattern = ref("\\b\\w{4}\\b");
const flags = reactive<Record<Flag, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
});
const testString = ref(
    `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
The five boxing wizards jump quickly.`,
);
const replacement = ref("");
const rightTab = ref<"match" | "replace">("match");

// ── Computed: flags string ────────────────────────────────────────────────────

const flagString = computed(() => FLAG_LIST.filter((f) => flags[f]).join(""));
const activeFlags = computed(() => FLAG_LIST.filter((f) => flags[f]));

// ── Core: regex execution ─────────────────────────────────────────────────────

const regexError = ref("");

const matches = computed((): RegExpExecArray[] => {
    const pat = pattern.value;
    if (!pat) {
        regexError.value = "";
        return [];
    }
    try {
        const re = new RegExp(pat, flagString.value);
        regexError.value = "";
        const found: RegExpExecArray[] = [];
        if (flags.g || flags.y) {
            re.lastIndex = 0;
            let m: RegExpExecArray | null;
            while ((m = re.exec(testString.value)) !== null) {
                found.push(m);
                // Prevent infinite loop on zero-length matches
                if (m[0].length === 0) re.lastIndex++;
                if (found.length > 5000) break; // safety cap
            }
        } else {
            const m = re.exec(testString.value);
            if (m) found.push(m);
        }
        return found;
    } catch (e: any) {
        regexError.value = e.message;
        return [];
    }
});

const matchCount = computed(() => matches.value.length);

// ── Computed: highlighted text ────────────────────────────────────────────────

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightedText = computed(() => {
    const str = testString.value;
    if (!str) return "";
    const list = matches.value;
    if (!list.length) return escapeHtml(str);

    let result = "";
    let lastIndex = 0;
    for (const m of list) {
        const start = m.index!;
        result += escapeHtml(str.slice(lastIndex, start));
        result += `<mark class="regex-match">${escapeHtml(m[0])}</mark>`;
        lastIndex = start + m[0].length;
    }
    result += escapeHtml(str.slice(lastIndex));
    return result;
});

// ── Computed: replaced text ───────────────────────────────────────────────────

const replacedText = computed(() => {
    if (!pattern.value || regexError.value) return testString.value;
    try {
        const re = new RegExp(pattern.value, flagString.value);
        return testString.value.replace(re, replacement.value);
    } catch {
        return testString.value;
    }
});

// ── Auto-switch to Results on mobile when a match is found ───────────────────
watch(matchCount, (n) => {
    if (isMobile.value && n > 0) activeTab.value = "results";
});
</script>

<style>
mark.regex-match {
    @apply bg-amber-200 dark:bg-amber-700/60 text-amber-900 dark:text-amber-100 rounded px-0.5 not-italic;
}
</style>

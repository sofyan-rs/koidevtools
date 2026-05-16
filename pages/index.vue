<template>
    <div class="h-full flex flex-col overflow-hidden">

        <!-- Header -->
        <header
            class="shrink-0 px-4 sm:px-6 pt-6 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        >
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                ✦ Dev Tools
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A collection of developer utilities — pick a tool to get started.
            </p>

            <!-- Search -->
            <div class="mt-4">
                <UInput
                    v-model="search"
                    icon="i-heroicons-magnifying-glass"
                    placeholder="Search tools…"
                    size="md"
                    :ui="{ icon: { trailing: { pointer: '' } } }"
                    autofocus
                >
                    <template v-if="search" #trailing>
                        <UButton
                            color="gray"
                            variant="link"
                            icon="i-heroicons-x-mark"
                            size="xs"
                            :padded="false"
                            @click="search = ''"
                        />
                    </template>
                </UInput>
            </div>

            <!-- Result count -->
            <p class="mt-2 text-xs text-gray-400 dark:text-gray-600">
                <template v-if="search">
                    {{ filteredTools.length }} of {{ TOOLS.length }} tools
                </template>
                <template v-else>
                    {{ TOOLS.length }} tools available
                </template>
            </p>
        </header>

        <!-- Tool grid -->
        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-gray-50 dark:bg-gray-950">

            <!-- Grid -->
            <div
                v-if="filteredTools.length"
                class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
            >
                <NuxtLink
                    v-for="tool in filteredTools"
                    :key="tool.path"
                    :to="tool.path"
                    class="group block"
                >
                    <div
                        class="h-full flex flex-col gap-3 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md dark:hover:shadow-none transition-all duration-150"
                    >
                        <!-- Icon + name row -->
                        <div class="flex items-center gap-3">
                            <div
                                class="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg"
                                :class="tool.color"
                            >
                                <UIcon :name="tool.icon" class="w-5 h-5" />
                            </div>
                            <div class="min-w-0">
                                <h2 class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {{ tool.name }}
                                </h2>
                            </div>
                            <UIcon
                                name="i-heroicons-arrow-top-right-on-square"
                                class="w-3.5 h-3.5 ml-auto shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors"
                            />
                        </div>

                        <!-- Description -->
                        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                            {{ tool.description }}
                        </p>

                        <!-- Tags -->
                        <div class="flex flex-wrap gap-1.5">
                            <span
                                v-for="tag in tool.tags"
                                :key="tag"
                                class="px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                :class="isTagMatch(tag) ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : ''"
                            >
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </NuxtLink>
            </div>

            <!-- Empty state -->
            <div
                v-else
                class="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-600 select-none"
            >
                <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 opacity-40" />
                <p class="text-sm">No tools match <span class="font-mono">"{{ search }}"</span></p>
                <UButton variant="ghost" color="gray" size="xs" @click="search = ''">
                    Clear search
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "Dev Tools" });

const search = ref("");

const TOOLS = [
    {
        name: "Markdown Editor",
        path: "/markdown",
        icon: "i-heroicons-document-text",
        color: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
        description: "Write Markdown with a live side-by-side preview. Supports toolbar shortcuts, open/save files, and auto-saves to localStorage.",
        tags: ["markdown", "editor", "preview", "writing"],
    },
    {
        name: "JSON Formatter",
        path: "/json",
        icon: "i-heroicons-code-bracket-square",
        color: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
        description: "Format, minify, validate, sort keys, and repair JSON. Syntax-highlighted output with copy support.",
        tags: ["json", "formatter", "validator", "minify", "repair"],
    },
    {
        name: "JSON to Dart",
        path: "/dart",
        icon: "i-heroicons-cube",
        color: "bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400",
        description: "Convert JSON to Dart model classes for Flutter. Generates fromJson, toJson, copyWith, and Equatable support.",
        tags: ["json", "dart", "flutter", "converter", "model", "class"],
    },
    {
        name: "Regex Tester",
        path: "/regex",
        icon: "i-heroicons-magnifying-glass",
        color: "bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400",
        description: "Test and debug regular expressions with live match highlighting, capture group details, and a replace mode.",
        tags: ["regex", "regexp", "pattern", "test", "match", "replace"],
    },
    {
        name: "API Tester",
        path: "/api",
        icon: "i-heroicons-paper-airplane",
        color: "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
        description: "Send HTTP requests with custom headers, query params, and body. Inspect response status, headers, and JSON output.",
        tags: ["api", "http", "rest", "request", "response", "headers"],
    },
    {
        name: "JWT Debugger",
        path: "/jwt",
        icon: "i-heroicons-key",
        color: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
        description: "Decode JWT tokens to inspect header and payload, verify HMAC signatures, and encode new tokens.",
        tags: ["jwt", "token", "decode", "encode", "auth", "hmac"],
    },
] as const;

const filteredTools = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q)),
    );
});

const isTagMatch = (tag: string) => {
    const q = search.value.trim().toLowerCase();
    return q.length > 0 && tag.includes(q);
};
</script>

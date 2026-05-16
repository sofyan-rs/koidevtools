<template>
    <div class="h-full flex flex-col overflow-hidden">
        <!-- Header -->
        <header
            class="flex items-center justify-between px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0"
        >
            <span
                class="text-base sm:text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-none truncate"
            >
                ✦ <span class="hidden xs:inline">Markdown </span>Editor
            </span>

            <div class="flex items-center gap-1 shrink-0">
                <!-- Mobile tab toggle (Edit / Preview) -->
                <div
                    class="flex items-center md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs font-medium"
                >
                    <button
                        class="px-3 py-1 rounded-md transition-colors"
                        :class="
                            activeTab === 'editor'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400'
                        "
                        @click="activeTab = 'editor'"
                    >
                        Edit
                    </button>
                    <button
                        class="px-3 py-1 rounded-md transition-colors"
                        :class="
                            activeTab === 'preview'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400'
                        "
                        @click="activeTab = 'preview'"
                    >
                        Preview
                    </button>
                </div>
            </div>
        </header>

        <!-- Toolbar -->
        <div
            class="flex items-center gap-0.5 px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 flex-wrap"
        >
            <!-- Hide toolbar on mobile preview tab -->
            <template v-if="activeTab === 'editor' || !isMobile">
                <UTooltip text="Bold">
                    <UButton
                        icon="i-heroicons-bold"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('**', '**', 'bold text')"
                    />
                </UTooltip>

                <UTooltip text="Italic">
                    <UButton
                        icon="i-heroicons-italic"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('*', '*', 'italic text')"
                    />
                </UTooltip>

                <UTooltip text="Heading 1">
                    <UButton
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('# ', '', 'Heading 1')"
                    >
                        H1
                    </UButton>
                </UTooltip>

                <UTooltip text="Heading 2">
                    <UButton
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('## ', '', 'Heading 2')"
                    >
                        H2
                    </UButton>
                </UTooltip>

                <div
                    class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1"
                />

                <UTooltip text="Link">
                    <UButton
                        icon="i-heroicons-link"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('[', '](url)', 'link text')"
                    />
                </UTooltip>

                <UTooltip text="Inline Code">
                    <UButton
                        icon="i-heroicons-code-bracket"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('`', '`', 'code')"
                    />
                </UTooltip>

                <UTooltip text="Code Block">
                    <UButton
                        icon="i-heroicons-code-bracket-square"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('```\n', '\n```', 'code block')"
                    />
                </UTooltip>

                <UTooltip text="Blockquote">
                    <UButton
                        icon="i-heroicons-chat-bubble-left-ellipsis"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('> ', '', 'quoted text')"
                    />
                </UTooltip>

                <div
                    class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5 sm:mx-1"
                />

                <UTooltip text="Unordered List">
                    <UButton
                        icon="i-heroicons-list-bullet"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('- ', '', 'list item')"
                    />
                </UTooltip>

                <UTooltip text="Ordered List">
                    <UButton
                        icon="i-heroicons-numbered-list"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('1. ', '', 'list item')"
                    />
                </UTooltip>

                <UTooltip text="Horizontal Rule">
                    <UButton
                        icon="i-heroicons-minus"
                        color="gray"
                        variant="ghost"
                        size="xs"
                        class="touch-target"
                        @click="insertMarkdown('\n---\n', '', '')"
                    />
                </UTooltip>
            </template>

            <div class="flex-1" />

            <!-- Hidden file input fallback for browsers without showOpenFilePicker -->
            <input
                ref="fileInputRef"
                type="file"
                accept=".md,.markdown,.txt"
                class="hidden"
                @change="onFileInputChange"
            />

            <UTooltip text="Open file">
                <UButton
                    icon="i-heroicons-folder-open"
                    color="gray"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="openFile"
                >
                    <span class="hidden sm:inline">Open</span>
                </UButton>
            </UTooltip>

            <UTooltip :text="copyLabel">
                <UButton
                    icon="i-heroicons-clipboard-document"
                    color="gray"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="copyMarkdown"
                >
                    <span class="hidden sm:inline">{{ copyLabel }}</span>
                </UButton>
            </UTooltip>

            <UTooltip :text="saveLabel">
                <UButton
                    icon="i-heroicons-arrow-down-tray"
                    color="primary"
                    variant="soft"
                    size="xs"
                    class="touch-target"
                    @click="saveFile"
                >
                    <span class="hidden sm:inline">{{ saveLabel }}</span>
                </UButton>
            </UTooltip>
        </div>

        <!-- Editor Area -->
        <div class="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
            <!-- Left Pane: Textarea — always visible on md+, conditionally on mobile -->
            <div
                class="flex-1 flex flex-col min-w-0"
                :class="isMobile && activeTab !== 'editor' ? 'hidden' : 'flex'"
            >
                <textarea
                    ref="textareaRef"
                    v-model="markdown"
                    class="flex-1 w-full p-3 sm:p-4 resize-none outline-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-none"
                    spellcheck="false"
                    placeholder="Write your markdown here..."
                />
            </div>

            <!-- Divider — desktop only -->
            <div
                class="hidden md:block w-px bg-gray-200 dark:bg-gray-700 shrink-0"
            />

            <!-- Right Pane: Preview — always visible on md+, conditionally on mobile -->
            <div
                class="overflow-y-auto min-w-0 p-4 sm:p-6 bg-white dark:bg-gray-900"
                :class="[
                    isMobile && activeTab !== 'preview' ? 'hidden' : 'flex-1',
                ]"
            >
                <div
                    class="prose prose-sm sm:prose dark:prose-invert max-w-none"
                    v-html="renderedMarkdown"
                />
            </div>
        </div>

        <!-- Status Bar -->
        <footer
            class="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0 text-xs text-gray-500 dark:text-gray-400"
        >
            <div class="flex items-center gap-2 sm:gap-4">
                <span>{{ wordCount }} words</span>
                <span>{{ charCount }} chars</span>
            </div>
            <div class="flex items-center gap-3 truncate max-w-[60%]">
                <!-- Auto-saved flash -->
                <Transition
                    enter-active-class="transition-opacity duration-200"
                    leave-active-class="transition-opacity duration-500"
                    enter-from-class="opacity-0"
                    leave-to-class="opacity-0"
                >
                    <span
                        v-if="autoSaved"
                        class="flex items-center gap-1 text-green-500 dark:text-green-400 shrink-0"
                    >
                        <UIcon
                            name="i-heroicons-check-circle"
                            class="w-3 h-3"
                        />
                        <span>Saved</span>
                    </span>
                </Transition>

                <!-- Open filename -->
                <span
                    v-if="openFileName"
                    class="flex items-center gap-1 truncate"
                >
                    <UIcon
                        name="i-heroicons-document-text"
                        class="shrink-0 w-3 h-3"
                    />
                    <span class="truncate">{{ openFileName }}</span>
                </span>
                <span v-else class="select-none opacity-60 hidden sm:inline"
                    >Markdown Editor</span
                >
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: "Markdown Editor" });

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Mobile detection (md breakpoint = 768px)
const isMobile = ref(false);
const activeTab = ref<"editor" | "preview">("editor");

const updateMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
    updateMobile();
    window.addEventListener("resize", updateMobile);

    // Restore saved content from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) markdown.value = saved;
});

onUnmounted(() => {
    window.removeEventListener("resize", updateMobile);
});

// Textarea ref for cursor manipulation
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// localStorage key
const STORAGE_KEY = "md-editor-content";

// Auto-save indicator
const autoSaved = ref(false);
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

// Default markdown content
const markdown = ref(`# Welcome to Markdown Editor

A **minimal**, _distraction-free_ markdown editor built with Nuxt 3 and Nuxt UI.

## Features

- Live preview
- Toolbar shortcuts
- Dark / Light mode
- Word & character count

## Code Example

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

> "The best writing tool is the one that gets out of your way."

---

Happy writing! ✦
`);

// Persist to localStorage on every change (debounced 500 ms)
watch(markdown, (val) => {
    localStorage.setItem(STORAGE_KEY, val);
    autoSaved.value = true;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => (autoSaved.value = false), 1500);
});

// Rendered markdown (computed)
const renderedMarkdown = computed(() => {
    const raw = marked.parse(markdown.value) as string;
    return DOMPurify.sanitize(raw);
});

// Word and character counts
const wordCount = computed(() => {
    const text = markdown.value.trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => markdown.value.length);

// Current open file name
const openFileName = ref("");

// Open file logic
const fileInputRef = ref<HTMLInputElement | null>(null);

const loadFileText = (text: string, name: string) => {
    markdown.value = text;
    openFileName.value = name;
    // Switch to editor tab on mobile so the user sees the content
    activeTab.value = "editor";
};

const openFile = async () => {
    // Try modern File System Access API first
    if ("showOpenFilePicker" in window) {
        try {
            const [handle] = await (window as any).showOpenFilePicker({
                multiple: false,
                types: [
                    {
                        description: "Markdown / Text files",
                        accept: {
                            "text/markdown": [".md", ".markdown"],
                            "text/plain": [".txt"],
                        },
                    },
                ],
            });
            const file: File = await handle.getFile();
            const text = await file.text();
            loadFileText(text, file.name);
            return;
        } catch (err: any) {
            if (err?.name === "AbortError") return;
        }
    }

    // Fallback: trigger hidden <input type="file">
    fileInputRef.value?.click();
};

const onFileInputChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    loadFileText(text, file.name);
    // Reset so the same file can be re-opened
    input.value = "";
};

// Copy state
const copyLabel = ref("Copy");

// Save file state
const saveLabel = ref("Save");

const saveFile = async () => {
    const filename = "document.md";
    const blob = new Blob([markdown.value], {
        type: "text/markdown;charset=utf-8",
    });

    // Try modern File System Access API first
    if ("showSaveFilePicker" in window) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: filename,
                types: [
                    {
                        description: "Markdown file",
                        accept: { "text/markdown": [".md", ".markdown"] },
                    },
                    {
                        description: "Text file",
                        accept: { "text/plain": [".txt"] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            saveLabel.value = "Saved!";
            setTimeout(() => (saveLabel.value = "Save"), 2000);
            return;
        } catch (err: any) {
            // User cancelled the picker — do nothing
            if (err?.name === "AbortError") return;
        }
    }

    // Fallback: anchor download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    saveLabel.value = "Saved!";
    setTimeout(() => (saveLabel.value = "Save"), 2000);
};

const copyMarkdown = async () => {
    try {
        await navigator.clipboard.writeText(markdown.value);
        copyLabel.value = "Copied!";
        setTimeout(() => (copyLabel.value = "Copy"), 2000);
    } catch {
        copyLabel.value = "Failed";
        setTimeout(() => (copyLabel.value = "Copy"), 2000);
    }
};

// Toolbar insert logic
const insertMarkdown = (before: string, after: string, placeholder: string) => {
    const ta = textareaRef.value;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.value.slice(start, end);
    const insertion = selected || placeholder;

    const newValue =
        markdown.value.slice(0, start) +
        before +
        insertion +
        after +
        markdown.value.slice(end);

    markdown.value = newValue;

    nextTick(() => {
        ta.focus();
        const newStart = start + before.length;
        const newEnd = newStart + insertion.length;
        ta.setSelectionRange(newStart, newEnd);
    });
};
</script>

<style>
/* Larger touch targets for toolbar buttons on mobile */
@media (max-width: 767px) {
    .touch-target button,
    .touch-target {
        min-width: 36px;
        min-height: 36px;
    }
}
</style>
